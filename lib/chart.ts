// Shared ECharts styling tokens so every chart across the app reads as one system.
import type { EChartsOption } from "echarts";
import { fmtShort } from "./format";

export const FONT =
  'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Brand categorical palette — vibrant red / blue / purple family on white.
export const PALETTE = [
  "#2563EB", // blue
  "#7C3AED", // violet
  "#F23C50", // red
  "#3B82F6", // bright blue
  "#A855F7", // bright violet
  "#EC4899", // pink
  "#4F46E5", // indigo
  "#F472B6", // rose
  "#60A5FA", // sky
  "#C084FC", // light violet
];

// Named brand hues.
export const BLUE = "#2563EB";
export const PURPLE = "#7C3AED";
export const RED = "#F23C50";
export const PINK = "#EC4899";
export const INDIGO = "#4F46E5";

// Semantic + legacy names (kept so existing pages keep compiling).
export const POSITIVE = "#16A34A";
export const NEGATIVE = "#F23C50";
export const INK = "#0F1B2D";
export const MUTED = "#64748B";
export const GRID = "#EEF2FB";
export const PRIMARY = "#2563EB"; // blue
export const TEAL = "#7C3AED"; // legacy name — now brand violet
export const GOLD = "#E0A82E"; // semantic "warning" only

/** Hover emphasis: lift the focused element, dim the rest. */
export const EMPHASIS = {
  focus: "series" as const,
  scale: true,
  itemStyle: { shadowBlur: 16, shadowColor: hexA(PRIMARY, 0.3) },
};

/** Click-select state so tapping a bar/slice visibly "locks on". */
export const SELECTED = {
  itemStyle: {
    borderColor: INK,
    borderWidth: 2,
    shadowBlur: 18,
    shadowColor: hexA(PURPLE, 0.5),
  },
};

/** Base tooltip config with a soft, glowing card look. */
export const tooltipBox = {
  backgroundColor: "#171A3B",
  borderWidth: 0,
  padding: [8, 12] as [number, number],
  textStyle: { color: "#fff", fontSize: 12, fontFamily: FONT },
  extraCssText:
    "border-radius:12px;box-shadow:0 10px 30px rgba(37,99,235,.28),0 2px 8px rgba(15,27,45,.20);",
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

/** Root defaults merged into every option in the <Chart> component.
 *  Update animations make filter changes morph smoothly in front of the user. */
export const baseOption: EChartsOption = {
  color: PALETTE,
  textStyle: { fontFamily: FONT, color: INK },
  animationDuration: 900,
  animationEasing: "cubicOut",
  animationDurationUpdate: 800,
  animationEasingUpdate: "cubicInOut",
  animationThreshold: 3000,
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

/** Horizontal gradient — handy for horizontal bars. */
export function hGradient(from: string, to: string) {
  return {
    type: "linear",
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  };
}
