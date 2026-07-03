"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtTenge, fmtShort, fmtPct } from "@/lib/format";
import { grid, tooltipBox, moneyAxis, catAxis, axisLabel, PALETTE, PRIMARY, PURPLE, MUTED, INK, GRID, hexA, EMPHASIS, SELECTED, vGradient } from "@/lib/chart";
import { rand, trendSeries } from "@/lib/rng";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const CHANNELS = ["Digital", "Соцсети", "ТВ/ATL", "Партнёры", "Наружная"];
const BASE_START = [200e6, 110e6, 280e6, 140e6, 90e6];

type Scope = "Все" | "Digital" | "ATL" | "Партнёры";

export default function MarketingPage() {
  const [scope, setScope] = useState<Scope>("Все");
  const [year, setYear] = useState("2024");

  const tag = scope + year;
  const yearK = year === "2024" ? 1 : 0.88;

  const scopeBoost = (ch: string) => {
    if (scope === "Все") return 1;
    if (scope === "Digital") return ch === "Digital" || ch === "Соцсети" ? 1.35 : 0.7;
    if (scope === "ATL") return ch === "ТВ/ATL" || ch === "Наружная" ? 1.35 : 0.7;
    if (scope === "Партнёры") return ch === "Партнёры" ? 1.5 : 0.65;
    return 1;
  };

  // ---- Per-channel monthly spend (10 months), shared by themeRiver / bar / scatter ----
  const riverSeries = useMemo(
    () =>
      CHANNELS.map((ch, i) =>
        trendSeries("mkt-spend-" + tag + ch, 10, {
          start: BASE_START[i] * yearK * scopeBoost(ch),
          growth: 0.015,
          noise: 0.08,
          min: 20e6,
        })
      ),
    [tag, yearK] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const months10 = useMemo(
    () => Array.from({ length: 10 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}-01`),
    [year]
  );

  const spendByChannel = useMemo(() => riverSeries.map((s) => s.reduce((a, b) => a + b, 0)), [riverSeries]);

  const channelPoints = useMemo(
    () =>
      CHANNELS.map((ch, i) => {
        const r = rand("mkt-roi-" + tag + ch);
        const roi = Math.round(r.range(120, 320));
        const budget = Math.round(spendByChannel[i] * r.range(1.05, 1.25));
        return { name: ch, value: [spendByChannel[i], roi, budget], itemStyle: { color: PALETTE[i] } };
      }),
    [tag, spendByChannel]
  );

  // ---- CAC & LTV monthly series (12 months) ----
  const cacSeries = useMemo(() => trendSeries("mkt-cac-" + tag, 12, { start: 15200, growth: -0.006, noise: 0.05, min: 9000 }), [tag]);
  const ltvSeries = useMemo(() => trendSeries("mkt-ltv-" + tag, 12, { start: 71000, growth: 0.008, noise: 0.04, min: 40000 }), [tag]);

  // ---- KPI headline values ----
  const rk = rand("mkt-kpi-" + tag);
  const cac = Math.round(rk.range(12800, 15400) / 100) * 100;
  const ltv = Math.round(rk.range(70000, 82000) / 500) * 500;
  const ratio = ltv / cac;
  const romi = rk.range(190, 235);
  const dCac = -rk.range(2.2, 6.8);
  const dLtv = rk.range(3, 9);
  const dRatio = rk.range(4, 11);
  const dRomi = rk.range(6, 15);
  const ratioLabel = ratio.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "x";

  // ---- 1. ThemeRiver: spend by channel over time ----
  const riverData: [string, number, string][] = [];
  CHANNELS.forEach((ch, ci) => {
    riverSeries[ci].forEach((v, mi) => {
      riverData.push([months10[mi], v, ch]);
    });
  });
  const themeRiverOption = {
    color: PALETTE,
    tooltip: {
      ...tooltipBox,
      trigger: "axis",
      axisPointer: { type: "line", lineStyle: { color: "rgba(15,27,45,0.2)", width: 1 } },
      valueFormatter: (v: number) => fmtTenge(v),
    },
    legend: { data: CHANNELS, top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    singleAxis: {
      type: "time",
      top: 42,
      bottom: 22,
      left: 12,
      right: 16,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: MUTED, fontSize: 10, formatter: (v: number) => MONTHS[new Date(v).getMonth()] },
      splitLine: { show: false },
    },
    series: [
      {
        type: "themeRiver",
        label: { show: false },
        emphasis: { focus: "series" },
        itemStyle: { borderColor: "#fff", borderWidth: 1 },
        data: riverData,
      },
    ],
  };

  // ---- 2. Scatter (bubble): ROI vs spend by channel ----
  const scatterOption = {
    grid: grid({ top: 18, right: 26, bottom: 34, left: 8 }),
    tooltip: {
      ...tooltipBox,
      trigger: "item",
      formatter: (p: any) =>
        `${p.data.name}<br/>Расходы: <b>${fmtTenge(p.value[0])}</b><br/>ROI: <b>${fmtPct(p.value[1])}</b><br/>Бюджет: ${fmtTenge(p.value[2])}`,
    },
    xAxis: {
      type: "value",
      name: "Расходы, ₸",
      nameLocation: "middle",
      nameGap: 28,
      nameTextStyle: { color: MUTED, fontSize: 11 },
      splitLine: { lineStyle: { color: GRID } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { ...axisLabel, formatter: (v: number) => fmtShort(v) },
    },
    yAxis: {
      type: "value",
      name: "ROI, %",
      nameTextStyle: { color: MUTED, fontSize: 11 },
      splitLine: { lineStyle: { color: GRID } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { ...axisLabel, formatter: (v: number) => v + "%" },
    },
    series: [
      {
        type: "scatter",
        cursor: "pointer",
        selectedMode: "single",
        symbolSize: (val: number[]) => Math.max(16, Math.min(58, Math.sqrt(val[2]) / 1400)),
        label: { show: true, formatter: (p: any) => p.data.name, position: "top", fontSize: 10, color: INK },
        labelLayout: { hideOverlap: true },
        emphasis: EMPHASIS,
        select: SELECTED,
        itemStyle: { opacity: 0.9, borderColor: "#fff", borderWidth: 1 },
        data: channelPoints,
      },
    ],
  };

  // ---- 3. Bar: spend by channel this period ----
  const barOption = {
    grid: grid({ top: 20, right: 18 }),
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtTenge(v) },
    xAxis: { ...catAxis(CHANNELS), axisLabel: { ...axisLabel, fontSize: 10, interval: 0, hideOverlap: true } },
    yAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtShort(v) } },
    series: [
      {
        type: "bar",
        barWidth: "52%",
        cursor: "pointer",
        selectedMode: "single",
        data: CHANNELS.map((ch, i) => ({ value: spendByChannel[i], itemStyle: { color: PALETTE[i], borderRadius: [4, 4, 0, 0] } })),
        emphasis: EMPHASIS,
        select: SELECTED,
        label: { show: true, position: "top", formatter: (p: any) => fmtShort(p.value), fontSize: 10, color: MUTED },
        labelLayout: { hideOverlap: true },
      },
    ],
  };

  // ---- 4. Dual-axis line: CAC (left) & LTV (right) by month ----
  const cacLtvOption = {
    grid: grid({ top: 36, right: 44 }),
    legend: { data: ["CAC", "LTV"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", valueFormatter: (v: number) => fmtTenge(v) },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: MONTHS,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: GRID } },
      axisLabel: { color: MUTED, fontSize: 11, hideOverlap: true },
    },
    yAxis: [
      {
        ...moneyAxis,
        name: "CAC",
        nameTextStyle: { color: MUTED, fontSize: 10, align: "left" },
        axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtShort(v) },
      },
      {
        type: "value",
        name: "LTV",
        position: "right",
        nameTextStyle: { color: MUTED, fontSize: 10, align: "right" },
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...axisLabel, formatter: (v: number) => fmtShort(v) },
      },
    ],
    series: [
      {
        name: "CAC",
        type: "line",
        smooth: true,
        symbolSize: 6,
        emphasis: { focus: "series" },
        data: cacSeries,
        lineStyle: { width: 3, color: PRIMARY },
        itemStyle: { color: PRIMARY },
        areaStyle: { color: vGradient(hexA(PRIMARY, 0.28), hexA(PRIMARY, 0)) },
      },
      {
        name: "LTV",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbolSize: 6,
        emphasis: { focus: "series" },
        data: ltvSeries,
        lineStyle: { width: 3, color: PURPLE },
        itemStyle: { color: PURPLE },
      },
    ],
  };

  return (
    <>
      <PageHeader
        title="Маркетинг"
        subtitle="Каналы привлечения, эффективность и стоимость клиента Alatau City Bank"
        right={
          <>
            <Segmented
              value={scope}
              onChange={(v) => setScope(v as Scope)}
              options={[
                { value: "Все", label: "Все" },
                { value: "Digital", label: "Digital" },
                { value: "ATL", label: "ATL" },
                { value: "Партнёры", label: "Партнёры" },
              ]}
            />
            <Select value={year} onChange={setYear} options={[{ value: "2024", label: "2024" }, { value: "2023", label: "2023" }]} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="CAC (стоимость клиента)" count={cac} format={fmtTenge} delta={dCac} deltaGood accent={PRIMARY} />
        <StatTile label="LTV (ценность клиента)" count={ltv} format={fmtTenge} delta={dLtv} accent={PURPLE} />
        <StatTile label="LTV / CAC" value={ratioLabel} delta={dRatio} accent={PALETTE[5]} hint="Норма ≥ 3x" />
        <StatTile label="ROMI" count={romi} format={(n) => fmtPct(n, 0)} delta={dRomi} accent={PALETTE[2]} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Расходы по каналам во времени" description="Поток маркетинговых расходов по каналам за 10 месяцев">
          <Chart option={themeRiverOption} height={340} />
        </ChartCard>
        <ChartCard title="ROI vs расходы по каналам" description="Пузырьковая диаграмма: размер пузыря — бюджет канала">
          <Chart option={scatterOption} height={340} />
        </ChartCard>
        <ChartCard title="Расходы по каналам" description="Совокупные расходы за период по каждому каналу">
          <Chart option={barOption} height={300} />
        </ChartCard>
        <ChartCard title="CAC и LTV по месяцам" description="Динамика стоимости и ценности клиента — две оси">
          <Chart option={cacLtvOption} height={300} />
        </ChartCard>
      </div>
    </>
  );
}
