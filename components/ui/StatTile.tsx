import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: ReactNode;
  delta?: number; // percent change
  deltaGood?: boolean; // if omitted, positive delta = good
  hint?: string;
  icon?: ReactNode;
  accent?: string; // hex for the icon chip
  className?: string;
};

export default function StatTile({
  label,
  value,
  delta,
  deltaGood,
  hint,
  icon,
  accent = "#2563EB",
  className,
}: Props) {
  const good = deltaGood ?? (delta ?? 0) >= 0;
  return (
    <article
      className={cn(
        "acb-card flex items-center gap-3 p-3 md:p-4 animate-fade-up",
        className
      )}
    >
      {icon ? (
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: accent + "1A", color: accent }}
        >
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-bank-muted">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <p className="text-lg font-semibold leading-none text-bank-ink md:text-xl">
            {value}
          </p>
          {delta !== undefined ? (
            <span
              className={cn(
                "text-xs font-semibold",
                good ? "text-bank-green" : "text-bank-red"
              )}
            >
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toLocaleString("ru-RU", {
                maximumFractionDigits: 1,
              })}
              %
            </span>
          ) : null}
        </div>
        {hint ? <p className="mt-0.5 truncate text-[11px] text-bank-muted">{hint}</p> : null}
      </div>
    </article>
  );
}
