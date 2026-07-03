import { cn } from "@/lib/cn";

export default function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-bank-primary to-bank-navy shadow-sm">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
          {/* Alatau — layered mountain peaks */}
          <path d="M4 24L12 10l4 7 3-5 5 12z" fill="#fff" fillOpacity="0.95" />
          <path d="M4 24l6-5 4 3 5-4 7 6z" fill="#E0A82E" fillOpacity="0.9" />
        </svg>
      </span>
      {withText ? (
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-bank-ink">
            Alatau City Bank
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-bank-muted">
            Analytics Suite
          </p>
        </div>
      ) : null}
    </div>
  );
}
