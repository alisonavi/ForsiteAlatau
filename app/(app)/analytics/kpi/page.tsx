"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtInt, fmtPct, fmtSigned } from "@/lib/format";
import { grid, tooltipBox, PALETTE, PRIMARY, TEAL, RED, GOLD, POSITIVE, NEGATIVE, INK, MUTED, GRID, hexA, EMPHASIS, SELECTED } from "@/lib/chart";
import { rand, trendSeries } from "@/lib/rng";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const DIRS = ["Финансы", "Клиенты", "Процессы", "Развитие"];

export default function KpiPage() {
  const [perspective, setPerspective] = useState("Все");
  const [year, setYear] = useState("2024");

  const seed = perspective + "-" + year;
  const yf = year === "2024" ? 1 : 0.93;

  // ---- Derived KPI dataset (seeded with the active filters) ----
  const attain = useMemo(() => {
    const r = rand("kpi-attain-" + seed);
    return DIRS.map(() => Math.min(99, Math.round(r.range(64, 95) * yf)));
  }, [seed, yf]);

  const overallIndex = Math.round(attain.reduce((a, b) => a + b, 0) / attain.length);
  const goalsTotal = 24;
  const goalsDone = Math.round((goalsTotal * overallIndex) / 100);
  const risk = useMemo(() => rand("kpi-risk-" + seed).int(3, 7), [seed]);
  const planDelta = useMemo(() => Math.round(rand("kpi-plan-" + seed).range(-30, 80)) / 10, [seed]);

  // ---- 1. Polar / radial bar: attainment per BSC direction ----
  const polarOption = {
    tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${DIRS[p.dataIndex]} · <b>${fmtPct(p.value)}</b> выполнения` },
    polar: { radius: [26, "80%"] },
    angleAxis: { max: 100, startAngle: 90, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false } },
    radiusAxis: { type: "category", data: DIRS, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: MUTED, fontSize: 11, hideOverlap: true }, z: 10 },
    series: [
      {
        type: "bar",
        coordinateSystem: "polar",
        roundCap: true,
        barWidth: 13,
        cursor: "pointer",
        selectedMode: "single",
        emphasis: EMPHASIS,
        select: SELECTED,
        data: attain.map((v, i) => ({
          value: v,
          itemStyle: { color: perspective === "Все" || perspective === DIRS[i] ? PALETTE[i] : hexA(PALETTE[i], 0.32) },
        })),
      },
    ],
  };

  // ---- 2. Bullet: fact vs target (horizontal, target markLine at 100%) ----
  const bulletKpis = ["ROE", "Рост портфеля", "NPS клиентов", "Цифровизация", "SLA обработки", "Обучение персонала"];
  const bulletFact = useMemo(() => {
    const r = rand("kpi-bullet-" + seed);
    return bulletKpis.map(() => Math.round(r.range(74, 116) * yf));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, yf]);
  const bulletOption = {
    grid: grid({ top: 12, right: 30, bottom: 8 }),
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtPct(v) },
    xAxis: { type: "value", max: 120, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11, formatter: (v: number) => v + "%" } },
    yAxis: { type: "category", data: bulletKpis, axisTick: { show: false }, axisLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11, hideOverlap: true } },
    series: [
      {
        name: "Факт",
        type: "bar",
        barWidth: 14,
        cursor: "pointer",
        selectedMode: "single",
        emphasis: EMPHASIS,
        select: SELECTED,
        data: bulletFact.map((v) => ({ value: v, itemStyle: { color: v >= 100 ? POSITIVE : v >= 85 ? GOLD : NEGATIVE, borderRadius: [0, 4, 4, 0] } })),
        label: { show: true, position: "right", formatter: (p: any) => fmtPct(p.value), fontSize: 10, color: MUTED },
        labelLayout: { hideOverlap: true },
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: { color: INK, type: "dashed", width: 1.5 },
          label: { show: true, formatter: "Цель", color: INK, fontSize: 10, position: "end" },
          data: [{ xAxis: 100 }],
        },
      },
    ],
  };

  // ---- 3. Multi-line: monthly dynamics of key KPI groups (%) ----
  const clamp = (arr: number[]) => arr.map((v) => Math.max(58, Math.min(99, v)));
  const lineFin = useMemo(() => clamp(trendSeries("kpi-lf-" + seed, 12, { start: 80, growth: 0.004, noise: 0.018 })), [seed]);
  const lineCli = useMemo(() => clamp(trendSeries("kpi-lc-" + seed, 12, { start: 74, growth: 0.006, noise: 0.02 })), [seed]);
  const lineOps = useMemo(() => clamp(trendSeries("kpi-lo-" + seed, 12, { start: 86, growth: 0.003, noise: 0.015 })), [seed]);
  const lineSeries = (name: string, data: number[], color: string) => ({
    name,
    type: "line" as const,
    smooth: true,
    symbolSize: 6,
    showSymbol: false,
    emphasis: { focus: "series" as const },
    lineStyle: { width: 3, color },
    itemStyle: { color },
    data,
  });
  const lineOption = {
    grid: grid({ top: 32, right: 18 }),
    legend: { data: ["Финансовые", "Клиентские", "Процессные"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", valueFormatter: (v: number) => fmtPct(v) },
    xAxis: { type: "category", boundaryGap: false, data: MONTHS, axisTick: { show: false }, axisLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11, hideOverlap: true } },
    yAxis: { type: "value", min: 50, max: 100, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11, formatter: (v: number) => v + "%" } },
    series: [lineSeries("Финансовые", lineFin, PRIMARY), lineSeries("Клиентские", lineCli, TEAL), lineSeries("Процессные", lineOps, RED)],
  };

  // ---- 4. 100% stacked bar: goal status per direction ----
  const status = useMemo(() => {
    const r = rand("kpi-status-" + seed);
    return DIRS.map(() => {
      const done = Math.round(r.range(52, 80));
      const partial = Math.round(r.range(8, Math.min(30, 96 - done)));
      const not = Math.max(0, 100 - done - partial);
      return [done, partial, not];
    });
  }, [seed]);
  const statusSeries = (name: string, idx: number, color: string, radius: number[]) => ({
    name,
    type: "bar" as const,
    stack: "s",
    barWidth: "48%",
    emphasis: { focus: "series" as const },
    data: status.map((s) => s[idx]),
    itemStyle: { color, borderRadius: radius },
  });
  const stackOption = {
    grid: grid({ top: 32, right: 18 }),
    legend: { data: ["Выполнено", "Частично", "Не выполнено"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtPct(v) },
    xAxis: { type: "category", data: DIRS, axisTick: { show: false }, axisLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11, hideOverlap: true } },
    yAxis: { type: "value", max: 100, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11, formatter: (v: number) => v + "%" } },
    series: [
      statusSeries("Выполнено", 0, POSITIVE, [4, 4, 0, 0]),
      statusSeries("Частично", 1, GOLD, [0, 0, 0, 0]),
      statusSeries("Не выполнено", 2, NEGATIVE, [0, 0, 4, 4]),
    ],
  };

  return (
    <>
      <PageHeader
        title="Ключевые показатели (KPI)"
        subtitle="Сбалансированная система показателей (BSC) Alatau City Bank"
        right={
          <>
            <Segmented
              value={perspective}
              onChange={setPerspective}
              options={[
                { value: "Все", label: "Все" },
                { value: "Финансы", label: "Финансы" },
                { value: "Клиенты", label: "Клиенты" },
                { value: "Процессы", label: "Процессы" },
                { value: "Развитие", label: "Развитие" },
              ]}
            />
            <Select value={year} onChange={setYear} options={[{ value: "2024", label: "2024" }, { value: "2023", label: "2023" }]} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Общий индекс KPI" count={overallIndex} format={fmtPct} delta={2.4} accent={PRIMARY} hint="Средневзвешенное по BSC" />
        <StatTile label="Выполнено целей" value={`${goalsDone}/${goalsTotal}`} delta={4.2} accent={POSITIVE} hint="Достигнутые цели периода" />
        <StatTile label="В зоне риска" count={risk} format={fmtInt} delta={-12.5} deltaGood accent={GOLD} hint="KPI ниже порога" />
        <StatTile label="Прирост к плану" value={fmtSigned(planDelta) + "%"} delta={1.8} deltaGood={planDelta >= 0} accent={TEAL} hint="Отклонение факт vs план" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Выполнение KPI по направлениям" description="Достижение целей по перспективам BSC — радиальные шкалы">
          <Chart option={polarOption} height={340} />
        </ChartCard>
        <ChartCard title="Ключевые метрики: факт vs цель" description="Горизонтальные шкалы факта с целевой отметкой 100%">
          <Chart option={bulletOption} height={340} />
        </ChartCard>
        <ChartCard title="Динамика ключевых KPI" description="Помесячное выполнение по группам показателей, %">
          <Chart option={lineOption} height={300} />
        </ChartCard>
        <ChartCard title="Статус целей по направлениям" description="Выполнено / частично / не выполнено — доля 100%">
          <Chart option={stackOption} height={300} />
        </ChartCard>
      </div>
    </>
  );
}
