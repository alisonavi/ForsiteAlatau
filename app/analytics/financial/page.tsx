"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtMoney, fmtPct } from "@/lib/format";
import { grid, tooltipBox, moneyAxis, PALETTE, PRIMARY, TEAL, GOLD, NEGATIVE, POSITIVE, hexA, vGradient } from "@/lib/chart";
import { trendSeries, splitTotal } from "@/lib/rng";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
type Cur = "KZT" | "USD";

export default function FinancialPage() {
  const [cur, setCur] = useState<Cur>("KZT");
  const [year, setYear] = useState("2024");

  const k = (cur === "USD" ? 1 / 470 : 1) * (year === "2024" ? 1 : year === "2023" ? 0.9 : 0.82);
  const money = (n: number) => fmtMoney(n * k, cur);

  // ---- 1. Composed: income/expense bars + profit line ----
  const income = useMemo(() => trendSeries("fin-inc-" + year, 12, { start: 30e9, growth: 0.015, noise: 0.06 }), [year]);
  const expense = useMemo(() => trendSeries("fin-exp-" + year, 12, { start: 18e9, growth: 0.012, noise: 0.05 }), [year]);
  const profit = income.map((v, i) => v - expense[i]);

  const composedOption = {
    grid: grid({ top: 34, right: 18 }),
    legend: { data: ["Доходы", "Расходы", "Чистая прибыль"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => money(v) },
    xAxis: { type: "category", data: MONTHS, axisTick: { show: false }, axisLine: { lineStyle: { color: "#EEF1F7" } }, axisLabel: { color: "#64748B", fontSize: 11 } },
    yAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => money(v) } },
    series: [
      { name: "Доходы", type: "bar", data: income, barGap: 0, barWidth: "32%", itemStyle: { borderRadius: [4, 4, 0, 0], color: hexA(PRIMARY, 0.9) } },
      { name: "Расходы", type: "bar", data: expense, barWidth: "32%", itemStyle: { borderRadius: [4, 4, 0, 0], color: hexA(GOLD, 0.85) } },
      { name: "Чистая прибыль", type: "line", smooth: true, symbolSize: 6, data: profit, lineStyle: { width: 3, color: POSITIVE }, itemStyle: { color: POSITIVE } },
    ],
  };

  // ---- 2. Stacked area: income structure ----
  const pct = useMemo(() => trendSeries("fin-pct-" + year, 12, { start: 20e9, growth: 0.014, noise: 0.05 }), [year]);
  const fee = useMemo(() => trendSeries("fin-fee-" + year, 12, { start: 7e9, growth: 0.02, noise: 0.08 }), [year]);
  const trade = useMemo(() => trendSeries("fin-trade-" + year, 12, { start: 3e9, growth: 0.018, noise: 0.14 }), [year]);
  const areaSeries = (name: string, data: number[], color: string) => ({
    name, type: "line" as const, stack: "inc", smooth: true, showSymbol: false,
    lineStyle: { width: 0 }, areaStyle: { color: hexA(color, 0.55) }, emphasis: { focus: "series" as const }, data,
  });
  const areaOption = {
    grid: grid({ top: 34, right: 18 }),
    legend: { data: ["Процентный", "Комиссионный", "Торговый"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", valueFormatter: (v: number) => money(v) },
    xAxis: { type: "category", boundaryGap: false, data: MONTHS, axisTick: { show: false }, axisLine: { lineStyle: { color: "#EEF1F7" } }, axisLabel: { color: "#64748B", fontSize: 11 } },
    yAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => money(v) } },
    series: [areaSeries("Процентный", pct, PRIMARY), areaSeries("Комиссионный", fee, TEAL), areaSeries("Торговый", trade, GOLD)],
  };

  // ---- 3. Donut: expense structure ----
  const donutParts = splitTotal("fin-donut-" + year, 150e9, 5);
  const donutNames = ["Персонал (ФОТ)", "IT и цифровизация", "Аренда и АХО", "Маркетинг", "Прочее"];
  const donutOption = {
    tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${p.name}<br/><b>${money(p.value)}</b> (${p.percent}%)` },
    legend: { orient: "vertical", right: 0, top: "center", icon: "circle", textStyle: { fontSize: 11 }, itemGap: 10 },
    series: [
      {
        type: "pie", radius: ["52%", "76%"], center: ["36%", "50%"], avoidLabelOverlap: true,
        itemStyle: { borderColor: "#fff", borderWidth: 3, borderRadius: 5 },
        label: { show: true, position: "center", formatter: "Расходы\nбанка", fontSize: 12, color: "#64748B", lineHeight: 16 },
        emphasis: { label: { show: true, fontSize: 13, fontWeight: 700, color: "#0F1B2D", formatter: (p: any) => `${p.percent}%` } },
        data: donutNames.map((name, i) => ({ name, value: donutParts[i], itemStyle: { color: PALETTE[i] } })),
      },
    ],
  };

  // ---- 4. Waterfall: P&L bridge ----
  const grossD = 390e9, opex = 150e9, prov = 60e9, tax = 30e9;
  const net = grossD - opex - prov - tax;
  const steps = [
    { name: "Валовый доход", delta: grossD, kind: "in" },
    { name: "Опер. расходы", delta: -opex, kind: "out" },
    { name: "Резервы", delta: -prov, kind: "out" },
    { name: "Налоги", delta: -tax, kind: "out" },
    { name: "Чистая прибыль", delta: net, kind: "total" },
  ];
  const placeholder: number[] = [];
  const bars: any[] = [];
  let run = 0;
  steps.forEach((s) => {
    if (s.kind === "total") {
      placeholder.push(0);
      bars.push({ value: net, itemStyle: { color: PRIMARY, borderRadius: [4, 4, 0, 0] } });
    } else if (s.delta >= 0) {
      placeholder.push(run);
      bars.push({ value: s.delta, itemStyle: { color: POSITIVE, borderRadius: [4, 4, 0, 0] } });
      run += s.delta;
    } else {
      run += s.delta;
      placeholder.push(run);
      bars.push({ value: -s.delta, itemStyle: { color: NEGATIVE, borderRadius: [4, 4, 0, 0] } });
    }
  });
  const waterfallOption = {
    grid: grid({ top: 20, right: 18 }),
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, formatter: (ps: any[]) => { const p = ps[1]; return `${p.name}<br/><b>${money(p.value)}</b>`; } },
    xAxis: { type: "category", data: steps.map((s) => s.name), axisTick: { show: false }, axisLine: { lineStyle: { color: "#EEF1F7" } }, axisLabel: { color: "#64748B", fontSize: 10, interval: 0 } },
    yAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => money(v) } },
    series: [
      { name: "placeholder", type: "bar", stack: "t", itemStyle: { color: "transparent" }, emphasis: { itemStyle: { color: "transparent" } }, data: placeholder },
      { name: "П/У", type: "bar", stack: "t", barWidth: "52%", data: bars, label: { show: true, position: "top", formatter: (p: any) => money(p.value), fontSize: 10, color: "#64748B" } },
    ],
  };

  return (
    <>
      <PageHeader
        title="Финансовые показатели банка"
        subtitle="Доходы, расходы, прибыль и структура P&L Alatau City Bank"
        right={
          <>
            <Segmented value={cur} onChange={(v) => setCur(v as Cur)} options={[{ value: "KZT", label: "₸ Тенге" }, { value: "USD", label: "$ Доллар" }]} />
            <Select value={year} onChange={setYear} options={[{ value: "2024", label: "2024" }, { value: "2023", label: "2023" }, { value: "2022", label: "2022" }]} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Операционный доход" value={money(390e9)} delta={9.2} accent={PRIMARY} />
        <StatTile label="Чистая прибыль" value={money(net)} delta={12.6} accent={POSITIVE} />
        <StatTile label="ROE" value={fmtPct(18.4)} delta={1.3} accent={TEAL} />
        <StatTile label="CIR (эффективность)" value={fmtPct(38.5)} delta={-2.1} deltaGood={false} accent={GOLD} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Доходы, расходы и прибыль" description="Помесячная динамика — комбинированный график">
          <Chart option={composedOption} height={300} />
        </ChartCard>
        <ChartCard title="Структура доходов" description="Накопительная область: процентный, комиссионный, торговый доход">
          <Chart option={areaOption} height={300} />
        </ChartCard>
        <ChartCard title="Структура расходов" description="Распределение операционных расходов банка">
          <Chart option={donutOption} height={300} />
        </ChartCard>
        <ChartCard title="Формирование прибыли (P&L bridge)" description="От валового дохода к чистой прибыли — водопад">
          <Chart option={waterfallOption} height={300} />
        </ChartCard>
      </div>
    </>
  );
}
