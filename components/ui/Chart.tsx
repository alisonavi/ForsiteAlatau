"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { baseOption } from "@/lib/chart";

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
  height?: number | string;
  className?: string;
  onEvents?: Record<string, (params: any) => void>;
};

export default function Chart({ option, height = 300, className, onEvents }: Props) {
  const merged = { ...baseOption, ...option } as EChartsOption;
  return (
    <ReactECharts
      option={merged}
      notMerge
      lazyUpdate
      style={{ height, width: "100%" }}
      opts={{ renderer: "canvas" }}
      onEvents={onEvents}
      className={className}
    />
  );
}
