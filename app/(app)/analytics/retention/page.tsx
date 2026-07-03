"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtInt, fmtPct } from "@/lib/format";
import { grid, tooltipBox, catAxis, axisLabel, PALETTE, PRIMARY, PURPLE, RED, PINK, POSITIVE, MUTED, GRID, INK, hexA, vGradient } from "@/lib/chart";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const AGE_GROUPS = ["до 30", "31–40", "41–50", "51–60", "старше 60"];
const BRANCHES = ["Lima", "Montevideo", "Buenos Aires"];
const TENURE = ["10+ лет", "6–10 лет"];

// Two-tone gender look
const WOMEN = "#C4B5FD"; // light violet

// Local number helpers
const one = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 1 });

type AgeMetric = "ret" | "turn";
type BranchScope = "branch" | "dept";

export default function RetentionPage() {
  const [year, setYear] = useState("2024");
  const [ageMetric, setAgeMetric] = useState<AgeMetric>("ret");
  const [branchScope, setBranchScope] = useState<BranchScope>("branch");

  // ---- 1. Динамика текучести и удержания (combo bar + line) ----
  const dynamicsOption = useMemo(() => {
    const leavers = [4, 6, 7, 8, 8, 3, 4, 12, 5, 5, 4, 6];
    const retention = [10, 8.7, 8.5, 9, 9, 10.5, 9, 8.2, 9.3, 9.4, 9.1, 10];
    return {
      grid: grid({ top: 34, right: 18, left: 8 }),
      legend: { data: ["Уволившиеся", "Удержание %"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: {
        ...tooltipBox,
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (ps: any[]) => {
          let s = ps[0].axisValue;
          ps.forEach((p) => {
            const val = p.seriesName === "Удержание %" ? fmtPct(p.value) : fmtInt(p.value) + " чел.";
            s += `<br/>${p.marker}${p.seriesName}: <b>${val}</b>`;
          });
          return s;
        },
      },
      xAxis: { ...catAxis(MONTHS), axisLabel: { ...axisLabel, hideOverlap: true } },
      yAxis: { type: "value", axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } }, axisLabel: { ...axisLabel } },
      series: [
        {
          name: "Уволившиеся",
          type: "bar",
          barWidth: "52%",
          emphasis: { focus: "series" as const },
          data: leavers.map((v, i) => ({
            value: v,
            itemStyle: { color: i === 7 ? PURPLE : hexA(INK, 0.18), borderRadius: [4, 4, 0, 0] },
          })),
        },
        {
          name: "Удержание %",
          type: "line",
          smooth: true,
          symbolSize: 6,
          emphasis: { focus: "series" as const },
          lineStyle: { width: 3, color: PURPLE },
          itemStyle: { color: PURPLE },
          data: retention,
        },
      ],
    };
  }, []);

  // ---- 2. Возрастная группа (grouped bar, toggle удержание/текучесть) ----
  const ageOption = useMemo(() => {
    const data =
      ageMetric === "ret"
        ? { men: [51, 83, 82, 78, 81], women: [69, 73, 79, 73, 64] }
        : { men: [49, 17, 18, 22, 19], women: [31, 27, 21, 27, 36] };
    return {
      grid: grid({ top: 34, right: 18, left: 8 }),
      legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtPct(v) },
      xAxis: { ...catAxis(AGE_GROUPS), axisLabel: { ...axisLabel, hideOverlap: true } },
      yAxis: { type: "value", axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } }, axisLabel: { ...axisLabel, formatter: (v: number) => v + "%" } },
      series: [
        { name: "Мужчины", type: "bar", barWidth: "34%", barGap: "10%", emphasis: { focus: "series" as const }, itemStyle: { color: PURPLE, borderRadius: [4, 4, 0, 0] }, data: data.men },
        { name: "Женщины", type: "bar", barWidth: "34%", emphasis: { focus: "series" as const }, itemStyle: { color: WOMEN, borderRadius: [4, 4, 0, 0] }, data: data.women },
      ],
    };
  }, [ageMetric]);

  // ---- 3. Текучесть vs удержание по филиалам (diverging horizontal bar) ----
  const branchOption = useMemo(() => {
    // yAxis order (bottom -> top): Lima, Montevideo, Buenos Aires
    const retention = [73.2, 75.5, 82.1];
    const turnover = [26.8, 24.5, 17.9];
    return {
      grid: grid({ top: 34, right: 18, left: 8 }),
      legend: { data: ["Текучесть %", "Удержание %"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: {
        ...tooltipBox,
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (ps: any[]) => {
          let s = ps[0].axisValue;
          ps.forEach((p) => {
            s += `<br/>${p.marker}${p.seriesName}: <b>${fmtPct(Math.abs(p.value))}</b>`;
          });
          return s;
        },
      },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: GRID } },
        axisLabel: { ...axisLabel, formatter: (v: number) => Math.abs(v) + "%" },
      },
      yAxis: { ...catAxis(BRANCHES), axisLabel: { ...axisLabel, hideOverlap: true } },
      series: [
        {
          name: "Текучесть %",
          type: "bar",
          stack: "total",
          barWidth: "54%",
          emphasis: { focus: "series" as const },
          itemStyle: { color: WOMEN, borderRadius: [4, 0, 0, 4] },
          data: turnover.map((v) => -v),
        },
        {
          name: "Удержание %",
          type: "bar",
          stack: "total",
          barWidth: "54%",
          emphasis: { focus: "series" as const },
          itemStyle: { color: PURPLE, borderRadius: [0, 4, 4, 0] },
          data: retention,
        },
      ],
    };
  }, [branchScope]);

  // ---- 4. Группа стажа по текучести (horizontal grouped bar) ----
  const tenureOption = useMemo(() => {
    // categories [10+ лет, 6–10 лет]
    const men = [16, 14];
    const women = [12, 29];
    return {
      grid: grid({ top: 34, right: 24, left: 8 }),
      legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtPct(v) },
      xAxis: { type: "value", axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } }, axisLabel: { ...axisLabel, formatter: (v: number) => v + "%" } },
      yAxis: { ...catAxis(TENURE), axisLabel: { ...axisLabel, hideOverlap: true } },
      series: [
        { name: "Мужчины", type: "bar", barWidth: "32%", barGap: "12%", emphasis: { focus: "series" as const }, itemStyle: { color: PURPLE, borderRadius: [0, 4, 4, 0] }, data: men, labelLayout: { hideOverlap: true }, label: { show: true, position: "right", formatter: (p: any) => p.value + "%", fontSize: 11, color: MUTED, fontWeight: 600 } },
        { name: "Женщины", type: "bar", barWidth: "32%", emphasis: { focus: "series" as const }, itemStyle: { color: WOMEN, borderRadius: [0, 4, 4, 0] }, data: women, labelLayout: { hideOverlap: true }, label: { show: true, position: "right", formatter: (p: any) => p.value + "%", fontSize: 11, color: MUTED, fontWeight: 600 } },
      ],
    };
  }, []);

  // ---- 5. Распределение возраста ухода (scatter, diamonds) ----
  const scatterOption = useMemo(() => {
    const points = [
      [1, 68], [1, 64], [1, 55], [1, 47], [1, 38],
      [2, 61], [2, 45], [2, 41], [2, 33], [2, 29],
      [3, 70], [3, 57], [3, 50], [3, 40],
      [4, 59], [4, 47], [5, 63],
    ];
    return {
      grid: grid({ top: 24, right: 24, left: 8 }),
      tooltip: {
        ...tooltipBox,
        trigger: "item",
        formatter: (p: any) => `Уволившиеся: <b>${fmtInt(p.value[0])}</b><br/>Возраст: <b>${fmtInt(p.value[1])} лет</b>`,
      },
      xAxis: {
        type: "value",
        name: "Уволившиеся",
        nameLocation: "middle",
        nameGap: 26,
        nameTextStyle: { color: MUTED, fontSize: 11 },
        min: 0,
        max: 5,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: GRID } },
        axisLabel: { ...axisLabel, hideOverlap: true },
      },
      yAxis: {
        type: "value",
        name: "Возраст",
        min: 0,
        max: 80,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: GRID } },
        axisLabel: { ...axisLabel },
      },
      series: [
        {
          type: "scatter",
          symbol: "diamond",
          symbolSize: 14,
          emphasis: { focus: "series" as const, scale: 1.3 },
          itemStyle: { color: PURPLE, opacity: 0.85, shadowBlur: 8, shadowColor: hexA(PURPLE, 0.3) },
          data: points,
        },
      ],
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Текучесть и удержание"
        subtitle="Движение сотрудников, удержание и стабильность штата"
        right={
          <Select
            value={year}
            onChange={setYear}
            options={[{ value: "2024", label: "2024" }, { value: "2023", label: "2023" }, { value: "2022", label: "2022" }]}
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Текучесть" count={24.3} format={fmtPct} delta={3.3} deltaGood={false} hint="за год" accent={RED} />
        <StatTile label="Удержание" count={75.7} format={fmtPct} delta={1.1} deltaGood hint="за год" accent={POSITIVE} />
        <StatTile label="Уволившиеся" count={71} format={fmtInt} delta={12.0} deltaGood={false} hint="сотрудников" accent={PINK} />
        <StatTile label="Ср. возраст ухода" count={52.4} format={one} hint="лет" accent={PURPLE} />
        <StatTile label="Ср. стаж при уходе" count={9.2} format={(n) => one(n) + " лет"} hint="на момент ухода" accent={PRIMARY} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Динамика текучести и удержания" description="по месяцам">
          <Chart option={dynamicsOption} height={300} />
        </ChartCard>
        <ChartCard
          title="Возрастная группа"
          description="по удержанию"
          right={
            <Segmented
              size="sm"
              value={ageMetric}
              onChange={(v) => setAgeMetric(v as AgeMetric)}
              options={[{ value: "ret", label: "Удержание" }, { value: "turn", label: "Текучесть" }]}
            />
          }
        >
          <Chart option={ageOption} height={300} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Текучесть vs удержание"
          description="по филиалам"
          right={
            <Segmented
              size="sm"
              value={branchScope}
              onChange={(v) => setBranchScope(v as BranchScope)}
              options={[{ value: "branch", label: "Филиал" }, { value: "dept", label: "Подразделение" }]}
            />
          }
        >
          <Chart option={branchOption} height={300} />
        </ChartCard>
        <ChartCard title="Группа стажа" description="по текучести">
          <Chart option={tenureOption} height={300} />
        </ChartCard>
        <ChartCard title="Распределение возраста ухода" description="возраст сотрудника vs уволившиеся">
          <Chart option={scatterOption} height={340} />
        </ChartCard>
      </div>
    </>
  );
}
