export function Logo({ className = "w-8 h-8", variant = "icon" }: { className?: string, variant?: "icon" | "horizontal" }) {
  const alt = variant === "horizontal" ? "TissuePro Tech ID" : "TissuePro Icon"
  return <img src="/tissuepro-logo.jpeg" alt={alt} className={className} />
}