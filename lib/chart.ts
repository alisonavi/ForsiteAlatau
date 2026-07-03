// Shared ECharts styling tokens so every chart across the app reads as one system.
import type { EChartsOption } from "echarts";
import { fmtShort } from "./format";

// Categorical palette — distinct hues, works on light backgrounds.
export const PALETTE = [
  "#2563EB", // blue
  "#0EA5A4", // teal
  "#7C5CFC", // violet
  "#E0A82E", // gold
  "#EC5B7C", // rose
  "#22C55E", // green
  "#38BDF8", // sky
  "#4F46E5", // indigo
  "#F97316", // orange
  "#94A3B8", // slate
];

export const POSITIVE = "#16A34A";
export const NEGATIVE = "#DC2626";
export const INK = "#0F1B2D";
export const MUTED = "#64748B";
export const GRID = "#EEF1F7";
export const PRIMARY = "#2563EB";
export const TEAL = "#0EA5A4";
export const GOLD = "#E0A82E";

export const FONT =
  'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Base tooltip config with a soft card look. */
export const tooltipBox = {
  backgroundColor: "#0F1B2D",
  borderWidth: 0,
  padding: [8, 12] as [number, number],
  textStyle: { color: "#fff", fontSize: 12, fontFamily: FONT },
  extraCssText: "border-radius:10px;box-shadow:0 8px 24px rgba(15,27,45,.18);",
};

/** Axis label style */
export const axisLabel = {
  color: MUTED,
  fontSize: 11,
  fontFamily: FONT,
};

/** A sensible default grid for cartesian charts. */
export const grid = (over: Record<string, unknown> = {}) => ({
  left: 8,
  right: 16,
  top: 24,
  bottom: 8,
  containLabel: true,
  ...over,
});

export const moneyAxis = {
  type: "value" as const,
  axisLine: { show: false },
  axisTick: { show: false },
  splitLine: { lineStyle: { color: GRID } },
  axisLabel: { ...axisLabel, formatter: (v: number) => fmtShort(v) },
};

export const catAxis = (data: string[]) => ({
  type: "category" as const,
  data,
  axisTick: { show: false },
  axisLine: { lineStyle: { color: GRID } },
  axisLabel: { ...axisLabel },
});

/** Root defaults merged into every option in the <Chart> component. */
export const baseOption: EChartsOption = {
  color: PALETTE,
  textStyle: { fontFamily: FONT, color: INK },
  animationDuration: 650,
  animationEasing: "cubicOut",
  tooltip: { ...tooltipBox, trigger: "item" },
};

/** Linear gradient helper for area/bar fills. */
export function vGradient(from: string, to: string) {
  return {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  };
}

export function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
