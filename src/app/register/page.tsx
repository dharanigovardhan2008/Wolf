"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ArrowRight, Check, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const field =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-[#111] placeholder:text-black/30 outline-none transition-colors focus:border-black";
const label = "mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const passwordLongEnough = formData.password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!passwordLongEnough) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error?.message ?? "Could not create your account. Please try again.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created, but automatic sign-in failed. Please sign in manually.");
        router.push("/login");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Could not connect. Please check your connection and try again.");
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
              Join the pack
            </h1>
            <p className="text-sm text-gray-500">Create your Wolf Theory account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="name" className={label}>Full name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Your full name"
                autoComplete="name"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="email" className={label}>Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="password" className={label}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
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
              {formData.password.length > 0 && (
                <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${passwordLongEnough ? "text-green-600" : "text-gray-400"}`}>
                  {passwordLongEnough ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  At least 8 characters
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={label}>Confirm password</label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Repeat password"
                autoComplete="new-password"
                className={field}
              />
              {formData.confirmPassword.length > 0 && (
                <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                  {passwordsMatch ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-black/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Already a member</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-black/15 py-4 text-sm font-bold uppercase tracking-widest text-[#111] transition-colors hover:bg-black/5"
          >
            Sign in instead
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}