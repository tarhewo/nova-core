export const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div
    className={`relative overflow-hidden rounded-2xl bg-muted/40 ${className}`}
    style={{
      backgroundImage:
        "linear-gradient(90deg, hsl(var(--muted) / 0.4) 0%, hsl(var(--muted) / 0.7) 50%, hsl(var(--muted) / 0.4) 100%)",
      backgroundSize: "200% 100%",
    }}
  >
    <div className="absolute inset-0 animate-shimmer" />
  </div>
);