"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtInt, fmtPct } from "@/lib/format";
import { grid, tooltipBox, moneyAxis, catAxis, axisLabel, PALETTE, PRIMARY, PURPLE, RED, PINK, POSITIVE, MUTED, GRID, INK, hexA, vGradient, hGradient } from "@/lib/chart";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const AGE_GROUPS = ["до 30", "31–40", "41–50", "51–60", "старше 60"];

// USD-thousands salary helper: n is a number of thousands, so 70.5 -> "$70,5 тыс."
const usdK = (n: number) => "$" + n.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + " тыс.";
const yearsFmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + " лет";

// Gender colours (match source): men = PURPLE, women = light violet.
const MEN = PURPLE;
const WOMEN = "#C4B5FD";

type BranchView = "branch" | "dept";

export default function CompensationPage() {
  const [year, setYear] = useState("2024");
  const [branchView, setBranchView] = useState<BranchView>("branch");

  // ---- A. Monthly average salary by gender (scatter/dot look) ----
  const trendOption = useMemo(() => {
    const men = [73, 75, 73, 64, 77, 78, 60, 80, 98, 64, 73, 79];
    const women = [71, 74, 62, 61, 58, 53, 62, 72, 72, 63, 70, 79];
    return {
      grid: grid({ top: 34, right: 18 }),
      legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "circle", textStyle: { fontSize: 11 } },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => usdK(v) },
      xAxis: { ...catAxis(MONTHS), axisLabel: { ...axisLabel, hideOverlap: true } },
      yAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => v + " тыс." } },
      series: [
        { name: "Мужчины", type: "scatter", symbolSize: 11, data: men, itemStyle: { color: MEN, opacity: 0.9 }, emphasis: { focus: "series" as const } },
        { name: "Женщины", type: "scatter", symbolSize: 11, data: women, itemStyle: { color: WOMEN, opacity: 0.95 }, emphasis: { focus: "series" as const } },
      ],
    };
  }, []);

  // ---- B. Average salary by age group × gender (grouped bar) ----
  const ageOption = useMemo(() => {
    const men = [85, 73, 71, 86, 72];
    const women = [65, 66, 67, 74, 70];
    return {
      grid: grid({ top: 34, right: 18 }),
      legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => usdK(v) },
      xAxis: { ...catAxis(AGE_GROUPS), axisLabel: { ...axisLabel, hideOverlap: true } },
      yAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => v + " тыс." } },
      series: [
        { name: "Мужчины", type: "bar", barWidth: "30%", data: men, itemStyle: { color: MEN, borderRadius: [4, 4, 0, 0] }, emphasis: { focus: "series" as const } },
        { name: "Женщины", type: "bar", barWidth: "30%", data: women, itemStyle: { color: WOMEN, borderRadius: [4, 4, 0, 0] }, emphasis: { focus: "series" as const } },
      ],
    };
  }, []);

  // ---- C. Salary by branch / department (horizontal bar w/ track) ----
  const branchOption = useMemo(() => {
    const data =
      branchView === "branch"
        ? [
            { name: "Lima", value: 68.8 },
            { name: "Montevideo", value: 68.9 },
            { name: "Buenos Aires", value: 73.5 },
          ]
        : [
            { name: "Продажи", value: 66.4 },
            { name: "Производство", value: 67.1 },
            { name: "Админ.", value: 70.0 },
            { name: "ИТ/ИС", value: 73.1 },
            { name: "Руководство", value: 164.1 },
          ];
    return {
      grid: grid({ top: 12, right: 56, left: 8 }),
      tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${p.name}<br/><b>${usdK(p.value)}</b>` },
      xAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => v + " тыс." } },
      yAxis: { ...catAxis(data.map((d) => d.name)), axisLabel: { ...axisLabel, hideOverlap: true } },
      series: [
        {
          type: "bar",
          barWidth: "56%",
          showBackground: true,
          backgroundStyle: { color: hexA(PRIMARY, 0.08), borderRadius: [0, 4, 4, 0] },
          data: data.map((d) => d.value),
          itemStyle: { color: hGradient(hexA(PRIMARY, 0.9), PURPLE), borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: "right", formatter: (p: any) => usdK(p.value), fontSize: 11, color: MUTED, fontWeight: 600 },
          labelLayout: { hideOverlap: true },
          emphasis: { focus: "series" as const },
        },
      ],
    };
  }, [branchView]);

  // ---- D. Salary by tenure × gender (horizontal grouped bar) ----
  const tenureOption = useMemo(() => {
    const cats = ["10+ лет", "6–10 лет"];
    const men = [71.7, 75.5];
    const women = [65.1, 67.4];
    return {
      grid: grid({ top: 34, right: 18, left: 8 }),
      legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => usdK(v) },
      xAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => v + " тыс." } },
      yAxis: { ...catAxis(cats), axisLabel: { ...axisLabel, hideOverlap: true } },
      series: [
        { name: "Мужчины", type: "bar", barWidth: "30%", data: men, itemStyle: { color: MEN, borderRadius: [0, 4, 4, 0] }, emphasis: { focus: "series" as const } },
        { name: "Женщины", type: "bar", barWidth: "30%", data: women, itemStyle: { color: WOMEN, borderRadius: [0, 4, 4, 0] }, emphasis: { focus: "series" as const } },
      ],
    };
  }, []);

  // ---- E. Salary distribution by role (scatter: headcount vs salary) ----
  const roleOption = useMemo(() => {
    const points = [
      [6, 55], [8, 72], [10, 60], [6, 95], [9, 100], [12, 66], [10, 58],
      [15, 73], [22, 72], [24, 62], [49, 71], [73, 67], [6, 105], [95, 63],
    ];
    return {
      grid: grid({ top: 20, right: 24, left: 8 }),
      tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${fmtInt(p.value[0])} чел.<br/><b>${usdK(p.value[1])}</b>` },
      xAxis: {
        type: "value" as const,
        name: "Сотрудники",
        nameLocation: "middle" as const,
        nameGap: 28,
        nameTextStyle: { color: MUTED, fontSize: 11 },
        min: 0,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: GRID } },
        axisLabel: { ...axisLabel, formatter: (v: number) => fmtInt(v) },
      },
      yAxis: {
        type: "value" as const,
        name: "$ тыс.",
        min: 0,
        max: 220,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: GRID } },
        axisLabel: { ...axisLabel, formatter: (v: number) => v + " тыс." },
      },
      series: [
        {
          type: "scatter",
          symbolSize: 12,
          data: points,
          itemStyle: { color: PURPLE, opacity: 0.85 },
          emphasis: { focus: "series" as const },
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { color: hexA(RED, 0.7), type: "dashed" as const, width: 1.5 },
            label: { formatter: "Ср.", color: RED, fontSize: 11, fontWeight: 600, position: "insideEndTop" as const },
            data: [{ yAxis: 70 }],
          },
        },
      ],
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Оплата труда и аналитика персонала"
        subtitle="Структура зарплат, равенство оплаты и стаж сотрудников"
        right={
          <Select
            label="Год"
            value={year}
            onChange={setYear}
            options={[
              { value: "2024", label: "2024" },
              { value: "2023", label: "2023" },
              { value: "2022", label: "2022" },
            ]}
          />
        }
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Ср. годовая зарплата" count={70.5} format={usdK} accent={PRIMARY} hint="мин $30,2 · макс $217,4 тыс." />
        <StatTile label="Ср. зарплата мужчин" count={73.73} format={usdK} accent={PURPLE} hint="мин $30,2 · макс $217,4 тыс." />
        <StatTile label="Ср. зарплата женщин" count={66.63} format={usdK} accent={PINK} hint="мин $34,4 · макс $138,6 тыс." />
        <StatTile label="Ср. бонус" count={9.9} format={usdK} accent={RED} hint="мин $1,5 · макс $104,9 тыс." />
        <StatTile label="Ср. стаж" count={9.5} format={yearsFmt} accent={POSITIVE} hint="мин 6,3 · макс 12,3" />
      </div>

      {/* Row 1 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Динамика средней зарплаты" description="по месяцам и полу">
          <Chart option={trendOption} height={300} />
        </ChartCard>
        <ChartCard title="Возрастная группа" description="по средней зарплате">
          <Chart option={ageOption} height={300} />
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Зарплата по филиалам"
          description="по филиалам"
          right={
            <Segmented
              size="sm"
              value={branchView}
              onChange={(v) => setBranchView(v as BranchView)}
              options={[
                { value: "branch", label: "Филиал" },
                { value: "dept", label: "Подразделение" },
              ]}
            />
          }
        >
          <Chart option={branchOption} height={300} />
        </ChartCard>
        <ChartCard title="Стаж работы" description="по средней зарплате">
          <Chart option={tenureOption} height={300} />
        </ChartCard>
        <ChartCard title="Распределение зарплаты по ролям" description="ср. зарплата vs численность">
          <Chart option={roleOption} height={340} />
        </ChartCard>
      </div>
    </>
  );
}
