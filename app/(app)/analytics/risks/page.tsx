"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtTenge, fmtPct } from "@/lib/format";
import { grid, tooltipBox, moneyAxis, PALETTE, PRIMARY, PURPLE, TEAL, GOLD, POSITIVE, NEGATIVE, INK, MUTED, GRID, EMPHASIS, SELECTED, vGradient, hexA } from "@/lib/chart";
import { rand, splitTotal } from "@/lib/rng";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const PROB = ["Низкая", "Средняя", "Высокая", "Крит."];
const IMPACT = ["Незнач.", "Умерен.", "Высок.", "Катастр."];
const INDUSTRIES = ["Строительство", "Торговля", "Нефтегаз", "АПК", "Транспорт", "Прочее"];

/** NPL-подобный ряд с десятыми долями процента (trendSeries округляет до целого — здесь нужна точность). */
function nplSeries(seed: string, start: number, drift: number): number[] {
  const r = rand(seed);
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < 12; i++) {
    v = Math.max(0.8, v + drift + r.range(-0.35, 0.35));
    out.push(Number(v.toFixed(2)));
  }
  return out;
}

export default function RisksPage() {
  const [year, setYear] = useState("2024");
  const [type, setType] = useState("Все");

  const factor = year === "2024" ? 1 : year === "2023" ? 0.9 : 0.82;

  // ---- KPI (seeded by year+type) ----
  const kpi = useMemo(() => {
    const r = rand("risks-kpi-" + year + type);
    return {
      car: r.range(16.4, 18.9),
      carD: r.range(0.2, 1.4),
      npl: r.range(4.1, 6.3),
      nplD: r.range(-0.9, 0.4),
      cor: r.range(1.0, 2.1),
      corD: r.range(-0.5, 0.3),
      lcr: r.range(134, 158),
      lcrD: r.range(-2, 7),
    };
  }, [year, type]);

  // ---- 1. Gauge: достаточность капитала (CAR) ----
  const gaugeOption = {
    tooltip: { ...tooltipBox, formatter: (p: any) => `Достаточность капитала<br/><b>${fmtPct(p.value)}</b>` },
    series: [
      {
        type: "gauge", startAngle: 210, endAngle: -30, min: 0, max: 24, radius: "92%",
        progress: { show: true, width: 14, itemStyle: { color: vGradient(hexA(PRIMARY, 0.9), PURPLE) } },
        axisLine: { lineStyle: { width: 14, color: [[0.33, NEGATIVE], [0.5, GOLD], [1, POSITIVE]] } },
        pointer: { show: true, length: "60%", width: 5 },
        axisTick: { show: false },
        splitLine: { length: 12, lineStyle: { color: GRID } },
        axisLabel: { color: MUTED, fontSize: 9, distance: 16 },
        anchor: { show: true, size: 10, itemStyle: { color: PRIMARY } },
        detail: { valueAnimation: true, formatter: (v: number) => fmtPct(v), color: INK, fontSize: 26, offsetCenter: [0, "46%"] },
        title: { offsetCenter: [0, "72%"], color: MUTED, fontSize: 11 },
        data: [{ value: Number(kpi.car.toFixed(1)), name: "CAR (норматив 12%)" }],
      },
    ],
  };

  // ---- 2. Heatmap: матрица рисков (вероятность × влияние) ----
  const heatData = useMemo(() => {
    const r = rand("risks-matrix-" + year + type);
    const cells: [number, number, number][] = [];
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const base = ((x + y) / 6) * 9;
        const v = Math.max(0, Math.min(9, Math.round(base + r.range(-1, 1))));
        cells.push([x, y, v]);
      }
    }
    return cells;
  }, [year, type]);

  const heatOption = {
    grid: grid({ top: 14, bottom: 48, left: 8, right: 12 }),
    tooltip: {
      ...tooltipBox, trigger: "item",
      formatter: (p: any) => `${PROB[p.data[0]]} × ${IMPACT[p.data[1]]}<br/>Риск-событий: <b>${p.data[2]}</b>`,
    },
    visualMap: {
      min: 0, max: 9, calculable: false, orient: "horizontal", left: "center", bottom: 0,
      inRange: { color: ["#DCFCE7", "#FEF3C7", "#FECACA", "#DC2626"] }, textStyle: { fontSize: 10, color: MUTED },
    },
    xAxis: {
      type: "category", data: PROB, splitArea: { show: true },
      axisTick: { show: false }, axisLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11 },
    },
    yAxis: {
      type: "category", data: IMPACT, splitArea: { show: true },
      axisTick: { show: false }, axisLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11 },
    },
    series: [
      {
        type: "heatmap", data: heatData,
        label: { show: true, fontSize: 11, color: INK },
        itemStyle: { borderColor: "#fff", borderWidth: 2 },
        cursor: "pointer",
        selectedMode: "single",
        emphasis: EMPHASIS,
        select: SELECTED,
      },
    ],
  };

  // ---- 3. Multi-line: NPL по сегментам, помесячно ----
  const segments = useMemo(
    () => [
      { name: "Розница", color: PALETTE[0], data: nplSeries("risks-npl-retail-" + year + type, 4.6, -0.03) },
      { name: "МСБ", color: PALETTE[3], data: nplSeries("risks-npl-sme-" + year + type, 6.4, -0.02) },
      { name: "Корпоратив", color: PALETTE[1], data: nplSeries("risks-npl-corp-" + year + type, 2.6, -0.01) },
    ],
    [year, type]
  );

  const lineOption = {
    grid: grid({ top: 34, right: 18 }),
    legend: { data: segments.map((s) => s.name), top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", valueFormatter: (v: number) => fmtPct(v) },
    xAxis: { type: "category", boundaryGap: false, data: MONTHS, axisTick: { show: false }, axisLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11 } },
    yAxis: { type: "value", axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11, formatter: (v: number) => fmtPct(v, 0) } },
    series: segments.map((s) => ({
      name: s.name, type: "line", smooth: true, symbolSize: 6, data: s.data,
      emphasis: { focus: "series" },
      lineStyle: { width: 3, color: s.color }, itemStyle: { color: s.color },
    })),
  };

  // ---- 4. Horizontal stacked bar: концентрация риска по отраслям ----
  const rows = useMemo(() => {
    const totalPortfolio = 780e9 * factor;
    const exposures = splitTotal("risks-ind-" + year + type, totalPortfolio, INDUSTRIES.length);
    const list = INDUSTRIES.map((name, i) => {
      const r = rand("risks-ind-" + i + "-" + year + type);
      const problemPct = r.range(0.04, 0.14);
      const watchPct = r.range(0.08, 0.18);
      const e = exposures[i];
      const problem = Math.round(e * problemPct);
      const watch = Math.round(e * watchPct);
      const standard = e - problem - watch;
      return { name, standard, watch, problem, total: e };
    });
    // по возрастанию — крупнейшая отрасль окажется сверху горизонтального графика
    list.sort((a, b) => a.total - b.total);
    return list;
  }, [year, type, factor]);

  const concentrationOption = {
    grid: grid({ top: 34, right: 24 }),
    legend: { data: ["Стандартные", "Под наблюдением", "Проблемные"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtTenge(v) },
    xAxis: { ...moneyAxis },
    yAxis: { type: "category", data: rows.map((r) => r.name), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: MUTED, fontSize: 11 } },
    series: [
      { name: "Стандартные", type: "bar", stack: "risk", barWidth: "58%", itemStyle: { color: POSITIVE, borderRadius: [4, 0, 0, 4] }, emphasis: { focus: "series" }, data: rows.map((r) => r.standard) },
      { name: "Под наблюдением", type: "bar", stack: "risk", itemStyle: { color: GOLD }, emphasis: { focus: "series" }, data: rows.map((r) => r.watch) },
      { name: "Проблемные", type: "bar", stack: "risk", itemStyle: { color: NEGATIVE, borderRadius: [0, 4, 4, 0] }, emphasis: { focus: "series" }, data: rows.map((r) => r.problem) },
    ],
  };

  return (
    <>
      <PageHeader
        title="Риски"
        subtitle="Кредитные, рыночные и операционные риски, достаточность капитала и резервы"
        right={
          <>
            <Segmented
              value={type}
              onChange={setType}
              options={[
                { value: "Все", label: "Все" },
                { value: "Кредитный", label: "Кредитный" },
                { value: "Рыночный", label: "Рыночный" },
                { value: "Операц.", label: "Операц." },
              ]}
            />
            <Select
              label="Год"
              value={year}
              onChange={setYear}
              options={[{ value: "2024", label: "2024" }, { value: "2023", label: "2023" }, { value: "2022", label: "2022" }]}
            />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Достаточность капитала (CAR)" count={kpi.car} format={(n) => fmtPct(n)} delta={kpi.carD} accent={PRIMARY} hint="Норматив ≥ 12%" />
        <StatTile label="NPL 90+" count={kpi.npl} format={(n) => fmtPct(n)} delta={kpi.nplD} deltaGood={kpi.nplD < 0} accent={NEGATIVE} hint="Проблемные кредиты" />
        <StatTile label="Стоимость риска (CoR)" count={kpi.cor} format={(n) => fmtPct(n)} delta={kpi.corD} deltaGood={kpi.corD < 0} accent={GOLD} />
        <StatTile label="LCR (ликвидность)" count={kpi.lcr} format={(n) => fmtPct(n, 0)} delta={kpi.lcrD} accent={TEAL} hint="Норматив ≥ 100%" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Достаточность капитала (CAR)" description="Собственный капитал к активам, взвешенным по риску; норматив 12%">
          <Chart option={gaugeOption} height={300} />
        </ChartCard>
        <ChartCard title="Матрица рисков (вероятность × влияние)" description="Число риск-событий по уровню вероятности и тяжести последствий">
          <Chart option={heatOption} height={300} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Покрытие резервами и NPL по сегментам" description="Доля проблемных кредитов (NPL) помесячно: розница, МСБ, корпоратив">
          <Chart option={lineOption} height={340} />
        </ChartCard>
        <ChartCard title="Концентрация риска по отраслям" description="Портфель по отраслям: стандартные, под наблюдением, проблемные">
          <Chart option={concentrationOption} height={340} />
        </ChartCard>
      </div>
    </>
  );
}
