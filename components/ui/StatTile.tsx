"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  /** Pre-formatted display value. Optional when `count` + `format` are provided. */
  value?: ReactNode;
  /** Raw number to animate a count-up to. When set with `format`, overrides `value`. */
  count?: number;
  /** Formatter applied to the animating count value. */
  format?: (n: number) => string;
  delta?: number; // percent change
  deltaGood?: boolean; // if omitted, positive delta = good
  hint?: string;
  icon?: ReactNode;
  accent?: string; // hex for the accent rail / icon chip
  className?: string;
};

/** Ease-out count-up that re-runs whenever the target value changes. */
function useCountUp(target: number | undefined, duration = 950): number {
  const [val, setVal] = useState(target ?? 0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (target == null || typeof target !== "number" || !isFinite(target)) return;
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return val;
}

export default function StatTile({
  label,
  value,
  count,
  format,
  delta,
  deltaGood,
  hint,
  icon,
  accent = "#2563EB",
  className,
}: Props) {
  const good = deltaGood ?? (delta ?? 0) >= 0;
  const animated = useCountUp(count);
  const display = count != null && format ? format(animated) : value;

  return (
    <article
      className={cn(
        "acb-card group relative flex items-center gap-3 overflow-hidden p-3 md:p-4 animate-fade-up hover:-translate-y-0.5",
        className
      )}
    >
      {/* accent rail — a hit of brand colour so tiles never read as dim */}
      <span
        className="absolute inset-y-0 left-0 w-1 transition-all duration-300 group-hover:w-1.5"
        style={{ background: accent }}
      />

      {icon ? (
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: accent + "1A", color: accent }}
        >
          {icon}
        </div>
      ) : null}

      <div className="min-w-0 flex-1 pl-1.5">
        <p className="truncate text-xs text-bank-muted">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <p className="text-lg font-semibold leading-none text-bank-ink tabular-nums md:text-xl">
            {display}
          </p>
          {delta !== undefined ? (
            <span
              className={cn(
                "text-xs font-semibold",
                good ? "text-bank-green" : "text-bank-red"
              )}
            >
              {delta >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(delta).toLocaleString("ru-RU", {
                maximumFractionDigits: 1,
              })}
              %
            </span>
          ) : null}
        </div>
        {hint ? (
          <p className="mt-0.5 truncate text-[11px] text-bank-muted">{hint}</p>
        ) : null}
      </div>
    </article>
  );
}
