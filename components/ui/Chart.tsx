"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { baseOption } from "@/lib/chart";
import { useIsMobile } from "@/lib/useMediaQuery";

// ECharts must run client-only (canvas needs the DOM).
const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[160px] animate-pulse rounded-xl bg-slate-100/70" />
  ),
});

type Props = {
  // Hand-authored ECharts option objects; kept loose so page code can build
  // them as plain literals without fighting deep union types.
  option: Record<string, any>;
  /** Desktop height. On phones this is capped so charts never eat the viewport. */
  height?: number | string;
  /** Explicit phone height override; defaults to a capped version of `height`. */
  mobileHeight?: number;
  className?: string;
  onEvents?: Record<string, (params: any) => void>;
  /**
   * By default charts MERGE updates so data changes morph smoothly (the
   * "changing in your eyes" feel). Set true only when a filter changes the
   * series *structure* (count/type), to avoid stale leftovers.
   */
  notMerge?: boolean;
};

export default function Chart({
  option,
  height = 300,
  mobileHeight,
  className,
  onEvents,
  notMerge = false,
}: Props) {
  const isMobile = useIsMobile();
  const merged = { ...baseOption, ...option } as EChartsOption;

  // Cap chart height on phones so a column of charts stays scannable instead of
  // forcing endless vertical scroll. Numeric heights only; string heights pass through.
  const effHeight =
    isMobile && typeof height === "number"
      ? mobileHeight ?? Math.max(220, Math.min(height, 280))
      : height;

  return (
    <ReactECharts
      option={merged}
      notMerge={notMerge}
      lazyUpdate
      style={{ height: effHeight, width: "100%" }}
      opts={{ renderer: "canvas" }}
      onEvents={onEvents}
      className={className}
    />
  );
}
