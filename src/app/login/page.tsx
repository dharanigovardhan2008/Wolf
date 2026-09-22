"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const field =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-[#111] placeholder:text-black/30 outline-none transition-colors focus:border-black";
const label = "mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        remember: remember ? "true" : "false",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not sign in. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.10)] sm:p-10">
          <div className="mb-8 flex justify-center">
            <Logo variant="compact" tone="dark" className="h-9" />
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-1.5 font-heading text-2xl font-extrabold tracking-tight text-[#111]">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500">Sign in to your Wolf Theory account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <p
                role="alert"
                className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <div>
              <label htmlFor="email" className={label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className={field}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className={label + " mb-0"}>Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-gray-500 hover:text-black">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={field + " pr-11"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-black/20"
              />
              Remember me for 30 days
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-black/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">New here</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-black/15 py-4 text-sm font-bold uppercase tracking-widest text-[#111] transition-colors hover:bg-black/5"
          >
            Create an account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-700">Dev credentials</p>
            <p className="font-mono text-xs text-amber-800">Admin: admin@wolftheory.com / WolfTheory@2024!</p>
            <p className="font-mono text-xs text-amber-800">Customer: customer@example.com / Customer@123!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[75vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}