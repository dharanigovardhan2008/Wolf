export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-surface rounded-card shadow-float overflow-hidden ${className}`}>{children}</div>;
}