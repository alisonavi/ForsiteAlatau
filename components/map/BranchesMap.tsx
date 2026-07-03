"use client";

import { useMemo, useRef, useState } from "react";
import KazakhstanMapSVG from "./KazakhstanMapSVG";
import type { RegionMetric } from "@/lib/regions";
import { cn } from "@/lib/cn";

function lerpColor(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

type Props = {
  data: RegionMetric[];
  valueLabel: string;
  getValue: (m: RegionMetric) => number;
  format: (n: number) => string;
  selectedIndex?: number | null;
  onSelectRegion?: (index: number | null) => void;
  className?: string;
  /** low/high endpoints of the choropleth scale */
  scale?: [string, string];
};

export default function BranchesMap({
  data,
  valueLabel,
  getValue,
  format,
  selectedIndex,
  onSelectRegion,
  className,
  scale = ["#E4ECFF", "#1D4ED8"],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ index: number; x: number; y: number } | null>(
    null
  );

  const byIndex = useMemo(() => {
    const m = new Map<number, RegionMetric>();
    data.forEach((d) => m.set(d.region.index, d));
    return m;
  }, [data]);

  const [min, max] = useMemo(() => {
    const vals = data.map(getValue);
    return [Math.min(...vals), Math.max(...vals)];
  }, [data, getValue]);

  const colorFor = (i: number) => {
    const m = byIndex.get(i);
    if (!m) return "#EEF2F8";
    if (selectedIndex != null && selectedIndex !== i) {
      return "#DBE3EF"; // dim non-selected
    }
    const t = max > min ? (getValue(m) - min) / (max - min) : 0.5;
    return lerpColor(scale[0], scale[1], 0.15 + t * 0.85);
  };

  const hovered = hover ? byIndex.get(hover.index) : null;

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      <KazakhstanMapSVG
        getRegionColor={colorFor}
        onRegionClick={(i) =>
          onSelectRegion?.(selectedIndex === i ? null : i)
        }
        onRegionHover={(i, e) => {
          const rect = containerRef.current?.getBoundingClientRect();
          setHover({
            index: i,
            x: e.clientX - (rect?.left ?? 0),
            y: e.clientY - (rect?.top ?? 0),
          });
        }}
        onRegionLeave={() => setHover(null)}
        onBackgroundClick={() => onSelectRegion?.(null)}
      />

      {hovered ? (
        <div
          className="pointer-events-none absolute z-20 w-max max-w-[220px] -translate-x-1/2 -translate-y-full rounded-xl bg-bank-ink px-3 py-2 text-white shadow-lg"
          style={{ left: hover!.x, top: hover!.y - 12 }}
        >
          <p className="text-[12px] font-semibold">{hovered.region.name}</p>
          <p className="mt-0.5 text-[11px] text-white/75">
            {valueLabel}:{" "}
            <span className="font-semibold text-white">
              {format(getValue(hovered))}
            </span>
          </p>
          <p className="text-[11px] text-white/75">
            Филиалов: <span className="font-semibold text-white">{hovered.branches}</span>
          </p>
        </div>
      ) : null}

      {/* gradient legend */}
      <div className="absolute bottom-1 left-1 flex items-center gap-2 rounded-lg bg-white/85 px-2.5 py-1.5 backdrop-blur">
        <span className="text-[10px] text-bank-muted">{format(min)}</span>
        <span
          className="h-2 w-24 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${scale[0]}, ${scale[1]})`,
          }}
        />
        <span className="text-[10px] text-bank-muted">{format(max)}</span>
      </div>
    </div>
  );
}
