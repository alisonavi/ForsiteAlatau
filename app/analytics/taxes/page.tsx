"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Select } from "@/components/ui/Controls";
import BranchesMap from "@/components/map/BranchesMap";
import { regionMetrics } from "@/lib/regions";
import { fmtTenge, fmtPct } from "@/lib/format";
import { grid, tooltipBox, moneyAxis, PALETTE, PRIMARY, TEAL, GOLD, hexA, vGradient } from "@/lib/chart";
import { trendSeries, splitTotal } from "@/lib/rng";

const TAX_TYPES = [
  { key: "kpn", label: "КПН", color: PRIMARY },
  { key: "nds", label: "НДС", color: TEAL },
  { key: "ipn", label: "ИПН", color: "#7C5CFC" },
  { key: "soc", label: "Соцналог", color: GOLD },
];
const QUARTERS = ["I кв", "II кв", "III кв", "IV кв"];

export default function TaxesPage() {
  const metrics = useMemo(() => regionMetrics(), []);
  const [year, setYear] = useState("2024");
  const [selected, setSelected] = useState<number | null>(null);

  const factor = year === "2024" ? 1 : year === "2023" ? 0.9 : 0.8;
  const getTax = (m: (typeof metrics)[number]) => m.taxes * factor;
  const totalTax = metrics.reduce((s, m) => s + getTax(m), 0);
  const selectedRegion = selected != null ? metrics.find((m) => m.region.index === selected) : null;

  // ---- structure by quarter (stacked bar) ----
  const structOption = {
    grid: grid({ top: 34, right: 16 }),
    legend: { data: TAX_TYPES.map((t) => t.label), top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtTenge(v) },
    xAxis: { type: "category", data: QUARTERS, axisTick: { show: false }, axisLine: { lineStyle: { color: "#EEF1F7" } }, axisLabel: { color: "#64748B", fontSize: 11 } },
    yAxis: { ...moneyAxis },
    series: TAX_TYPES.map((t, ti) => {
      const q = splitTotal(`tax-${t.key}-${year}`, (totalTax / 4) * (0.7 + ti * 0.1), 4);
      return {
        name: t.label, type: "bar", stack: "tax", barWidth: "46%",
        itemStyle: { color: t.color, borderRadius: ti === TAX_TYPES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0] },
        emphasis: { focus: "series" }, data: q,
      };
    }),
  };

  // ---- top regions by tax (horizontal bar) ----
  const top = [...metrics].sort((a, b) => getTax(b) - getTax(a)).slice(0, 10).reverse();
  const topOption = {
    grid: grid({ left: 6, right: 40 }),
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtTenge(v) },
    xAxis: { ...moneyAxis },
    yAxis: { type: "category", data: top.map((m) => m.region.short), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: "#64748B", fontSize: 11 } },
    series: [
      {
        type: "bar", data: top.map((m) => Math.round(getTax(m))), barWidth: "60%",
        itemStyle: { borderRadius: [0, 6, 6, 0], color: vGradient(hexA(PRIMARY, 0.9), GOLD) },
        label: { show: true, position: "right", formatter: (p: any) => fmtTenge(p.value), fontSize: 10, color: "#64748B" },
      },
    ],
  };

  // ---- yearly dynamics (line) ----
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const dyn = trendSeries("tax-dyn", 6, { start: totalTax * 0.62, growth: 0.09, noise: 0.05 });
  const lineOption = {
    grid: grid({ top: 20, right: 20 }),
    tooltip: { ...tooltipBox, trigger: "axis", valueFormatter: (v: number) => fmtTenge(v) },
    xAxis: { type: "category", boundaryGap: false, data: years, axisTick: { show: false }, axisLine: { lineStyle: { color: "#EEF1F7" } }, axisLabel: { color: "#64748B", fontSize: 11 } },
    yAxis: { ...moneyAxis },
    series: [
      {
        type: "line", smooth: true, symbolSize: 7, data: dyn,
        lineStyle: { width: 3, color: PRIMARY }, itemStyle: { color: PRIMARY },
        areaStyle: { color: vGradient(hexA(PRIMARY, 0.28), hexA(PRIMARY, 0)) },
      },
    ],
  };

  return (
    <>
      <PageHeader
        title="Налоги по филиалам"
        subtitle="Налоговые отчисления Alatau City Bank в разрезе регионов и видов налога"
        right={
          <Select
            label="Год"
            value={year}
            onChange={setYear}
            options={[{ value: "2024", label: "2024" }, { value: "2023", label: "2023" }, { value: "2022", label: "2022" }]}
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Всего уплачено налогов" value={fmtTenge(totalTax)} delta={10.4} accent={PRIMARY} />
        <StatTile label="Эффективная ставка" value={fmtPct(16.8)} delta={-0.6} deltaGood={false} accent={TEAL} />
        <StatTile label="Крупнейший регион" value={top[top.length - 1]?.region.short ?? "—"} hint={fmtTenge(getTax(top[top.length - 1]))} accent={GOLD} />
        <StatTile label="Регионов присутствия" value={String(metrics.length)} accent="#7C5CFC" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-3"
          title="Налоги по регионам Казахстана"
          description="Интенсивность цвета — объём налоговых отчислений; выберите регион"
        >
          <div className="h-[360px]">
            <BranchesMap
              data={metrics}
              valueLabel="Налоги"
              getValue={getTax}
              format={fmtTenge}
              selectedIndex={selected}
              onSelectRegion={setSelected}
              scale={["#FDEFD6", "#B45309"]}
            />
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
            {selectedRegion ? (
              <span className="text-bank-ink">
                <b>{selectedRegion.region.name}</b> — уплачено налогов{" "}
                <b>{fmtTenge(getTax(selectedRegion))}</b>, филиалов: {selectedRegion.branches}
              </span>
            ) : (
              <span className="text-bank-muted">Выберите регион на карте для детализации по налоговым отчислениям.</span>
            )}
          </div>
        </ChartCard>

        <ChartCard className="lg:col-span-2" title="Структура налогов по кварталам" description="КПН, НДС, ИПН и социальный налог">
          <Chart option={structOption} height={300} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="ТОП-10 регионов по налогам" description="Крупнейшие регионы по объёму отчислений">
          <Chart option={topOption} height={340} />
        </ChartCard>
        <ChartCard title="Динамика налоговых отчислений" description="Совокупные налоги банка по годам">
          <Chart option={lineOption} height={340} />
        </ChartCard>
      </div>
    </>
  );
}
