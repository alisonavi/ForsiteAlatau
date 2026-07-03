"use client";

import { cn } from "@/lib/cn";

export type Option = { value: string; label: string };

/** Pill-style segmented toggle (tabs). */
export function Segmented({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex rounded-lg bg-bank-primary-soft/70 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md font-medium transition-all duration-200 active:scale-95",
            size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[13px]",
            value === o.value
              ? "bg-white text-bank-primary shadow-sm ring-1 ring-bank-primary/15"
              : "text-bank-muted hover:text-bank-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Styled native select — reliable and accessible. */
export function Select({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label className={cn("inline-flex items-center gap-2", className)}>
      {label ? <span className="text-xs text-bank-muted">{label}</span> : null}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-lg border border-bank-border bg-white py-1.5 pl-3 pr-8 text-[13px] font-medium text-bank-ink outline-none transition-colors hover:border-bank-primary/50 focus:border-bank-primary"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-bank-muted"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </label>
  );
}

/** Small chip toggle used for multi-select-ish year / segment pickers. */
export function ChipToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "acb-chip border transition-colors",
        active
          ? "border-bank-primary bg-bank-primary-soft text-bank-primary"
          : "border-bank-border bg-white text-bank-muted hover:text-bank-ink"
      )}
    >
      {label}
    </button>
  );
}
