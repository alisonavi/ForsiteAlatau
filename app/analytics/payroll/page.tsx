"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtInt, fmtTenge, fmtPct } from "@/lib/format";
import { grid, tooltipBox, moneyAxis, catAxis, axisLabel, PALETTE, PRIMARY, TEAL, GOLD, MUTED, hexA } from "@/lib/chart";
import { rand, trendSeries } from "@/lib/rng";
import { regionMetrics } from "@/lib/regions";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const QUARTERS = ["I кв.", "II кв.", "III кв.", "IV кв."];
const AGE_BANDS = ["18–25", "26–35", "36–45", "46–55", "56+"];
const DEPTS = ["Розничный бизнес", "Корпоративный бизнес", "IT и цифровизация", "Операционный блок", "Управление и поддержка"];

type View = "fot" | "head";

export default function PayrollPage() {
  const [year, setYear] = useState("2024");
  const [view, setView] = useState<View>("fot");
  const seed = year + "-" + view;

  // ---- KPI base figures (deterministic, seeded with year + view) ----
  const yearK = year === "2024" ? 1 : year === "2023" ? 0.92 : 0.85;
  const kpi = useMemo(() => {
    const rk = rand("pay-kpi-" + seed);
    const headcount = Math.round(4200 * yearK + rk.range(-90, 130));
    const avgSalary = Math.round((508000 * yearK + rk.range(-8000, 26000)) / 1000) * 1000;
    const fotYear = headcount * avgSalary * 12;
    const turnover = 11 + rk.range(-1.4, 1.8);
    return {
      headcount,
      avgSalary,
      fotYear,
      turnover,
      dFot: 6 + rk.range(0, 4),
      dSal: 4 + rk.range(0, 4),
      dHead: 1.5 + rk.range(0, 2.6),
      dTurn: rk.range(-1.6, 0.9),
    };
  }, [seed, yearK]);

  // ---- 1. Population pyramid: age × gender structure ----
  const pyramidOption = useMemo(() => {
    const rp = rand("pay-pyr-" + seed);
    const menTotal = Math.round(kpi.headcount * 0.42);
    const womenTotal = kpi.headcount - menTotal;
    const menShape = [0.14, 0.34, 0.26, 0.16, 0.1];
    const womenShape = [0.18, 0.36, 0.24, 0.14, 0.08];
    const men = menShape.map((w) => Math.round(menTotal * w * (0.9 + rp.range(0, 0.2))));
    const women = womenShape.map((w) => Math.round(womenTotal * w * (0.9 + rp.range(0, 0.2))));
    return {
      grid: grid({ top: 30, left: 8, right: 18 }),
      legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: {
        ...tooltipBox,
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (ps: any[]) => {
          let s = ps[0].axisValue + " лет";
          ps.forEach((p) => {
            s += `<br/>${p.marker}${p.seriesName}: <b>${fmtInt(Math.abs(p.value))} чел.</b>`;
          });
          return s;
        },
      },
      xAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtInt(Math.abs(v)) } },
      yAxis: { ...catAxis(AGE_BANDS), inverse: true },
      series: [
        { name: "Мужчины", type: "bar", stack: "pop", data: men.map((v) => -v), barWidth: "62%", itemStyle: { color: hexA(PRIMARY, 0.9), borderRadius: [4, 0, 0, 4] } },
        { name: "Женщины", type: "bar", stack: "pop", data: women, barWidth: "62%", itemStyle: { color: hexA(PALETTE[4], 0.9), borderRadius: [0, 4, 4, 0] } },
      ],
    };
  }, [seed, kpi.headcount]);

  // ---- 2. Stacked bar: ФОТ by department across quarters ----
  const stackedOption = useMemo(() => {
    const quarterFot = kpi.fotYear / 4;
    const deptFrac = [0.34, 0.22, 0.16, 0.16, 0.12];
    const deptSeries = DEPTS.map((name, i) => ({
      name,
      type: "bar" as const,
      stack: "fot",
      barWidth: "52%",
      emphasis: { focus: "series" as const },
      itemStyle: { color: PALETTE[i] },
      data: trendSeries("pay-dept-" + seed + i, 4, { start: quarterFot * deptFrac[i], growth: 0.02, noise: 0.05 }),
    }));
    return {
      grid: grid({ top: 34, right: 18 }),
      legend: { data: DEPTS, top: 0, icon: "roundRect", textStyle: { fontSize: 10 }, itemGap: 10 },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtTenge(v) },
      xAxis: catAxis(QUARTERS),
      yAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtTenge(v) } },
      series: deptSeries,
    };
  }, [seed, kpi.fotYear]);

  // ---- 3. Dual-axis line: ФОТ (₸) + headcount by month ----
  const dualOption = useMemo(() => {
    const fotMonthly = trendSeries("pay-fotm-" + seed, 12, { start: (kpi.fotYear / 12) * 0.9, growth: 0.011, noise: 0.03 });
    const headMonthly = trendSeries("pay-headm-" + seed, 12, { start: kpi.headcount * 0.94, growth: 0.005, noise: 0.012 });
    return {
      grid: grid({ top: 34, right: 48, left: 8 }),
      legend: { data: ["ФОТ", "Численность"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: {
        ...tooltipBox,
        trigger: "axis",
        formatter: (ps: any[]) => {
          let s = ps[0].axisValue;
          ps.forEach((p) => {
            const val = p.seriesName === "Численность" ? fmtInt(p.value) + " чел." : fmtTenge(p.value);
            s += `<br/>${p.marker}${p.seriesName}: <b>${val}</b>`;
          });
          return s;
        },
      },
      xAxis: { ...catAxis(MONTHS), boundaryGap: false },
      yAxis: [
        { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtTenge(v) } },
        { type: "value", position: "right", splitLine: { show: false }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { ...axisLabel, formatter: (v: number) => fmtInt(v) } },
      ],
      series: [
        { name: "ФОТ", type: "line", smooth: true, showSymbol: false, yAxisIndex: 0, lineStyle: { width: 3, color: PRIMARY }, areaStyle: { color: hexA(PRIMARY, 0.12) }, itemStyle: { color: PRIMARY }, data: fotMonthly },
        { name: "Численность", type: "line", smooth: true, symbolSize: 6, yAxisIndex: 1, lineStyle: { width: 3, color: GOLD }, itemStyle: { color: GOLD }, data: headMonthly.map((v) => Math.round(v)) },
      ],
    };
  }, [seed, kpi.fotYear, kpi.headcount]);

  // ---- 4. Horizontal bar: headcount by branch region (top 8) ----
  const regionOption = useMemo(() => {
    const rm = regionMetrics();
    const totalBr = rm.reduce((a, b) => a + b.branches, 0);
    const rr = rand("pay-reg-" + seed);
    const rows = rm
      .map((m) => ({ name: m.region.short, value: Math.round((kpi.headcount * m.branches) / totalBr * (0.92 + rr.range(0, 0.16))) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    const disp = [...rows].reverse();
    return {
      grid: grid({ top: 12, right: 52, left: 8 }),
      tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${p.name}<br/><b>${fmtInt(p.value)} чел.</b>` },
      xAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtInt(v) } },
      yAxis: catAxis(disp.map((d) => d.name)),
      series: [
        {
          type: "bar",
          barWidth: "58%",
          data: disp.map((d) => d.value),
          itemStyle: { color: hexA(TEAL, 0.9), borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: "right", formatter: (p: any) => fmtInt(p.value), fontSize: 11, color: MUTED, fontWeight: 600 },
        },
      ],
    };
  }, [seed, kpi.headcount]);

  return (
    <>
      <PageHeader
        title="ФОТ и штат"
        subtitle="Фонд оплаты труда, численность и структура персонала Alatau City Bank"
        right={
          <>
            <Select value={year} onChange={setYear} options={[{ value: "2024", label: "2024" }, { value: "2023", label: "2023" }, { value: "2022", label: "2022" }]} />
            <Segmented value={view} onChange={(v) => setView(v as View)} options={[{ value: "fot", label: "ФОТ" }, { value: "head", label: "Штат" }]} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="ФОТ в год" value={fmtTenge(kpi.fotYear)} delta={kpi.dFot} accent={PRIMARY} hint="за год" />
        <StatTile label="Средняя зарплата" value={fmtTenge(kpi.avgSalary)} delta={kpi.dSal} accent={TEAL} hint="₸ в месяц" />
        <StatTile label="Численность" value={fmtInt(kpi.headcount)} delta={kpi.dHead} accent={GOLD} hint="сотрудников" />
        <StatTile label="Текучесть кадров" value={fmtPct(kpi.turnover)} delta={kpi.dTurn} deltaGood={kpi.dTurn <= 0} accent={PALETTE[4]} hint="за год" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Возрастно-гендерная структура персонала" description="Распределение сотрудников по возрастным группам — мужчины и женщины">
          <Chart option={pyramidOption} height={340} />
        </ChartCard>
        <ChartCard title="ФОТ по департаментам" description="Накопительная структура фонда оплаты труда по кварталам (₸)">
          <Chart option={stackedOption} height={340} />
        </ChartCard>
        <ChartCard title="Динамика ФОТ и численности" description="Помесячно: фонд оплаты труда (₸) и численность персонала">
          <Chart option={dualOption} height={300} />
        </ChartCard>
        <ChartCard title="Численность по филиалам и регионам" description="Топ-8 регионов присутствия по числу сотрудников">
          <Chart option={regionOption} height={300} />
        </ChartCard>
      </div>
    </>
  );
}
