"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtInt, fmtPct } from "@/lib/format";
import { grid, tooltipBox, moneyAxis, catAxis, axisLabel, PRIMARY, PURPLE, RED, PINK, POSITIVE, MUTED } from "@/lib/chart";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

// Two-tone gender palette (matches source): men = brand violet, women = light violet.
const MEN = PURPLE; // #7C3AED
const WOMEN = "#C4B5FD";

// USD-thousands salary formatter: n is a number of thousands, so 70.5 -> "$70,5 тыс.".
const usdK = (n: number) => "$" + n.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + " тыс.";

type PopMode = "abs" | "share";

export default function InclusionPage() {
  const [year, setYear] = useState("2024");
  const [popMode, setPopMode] = useState<PopMode>("abs");

  // ---- A. Headcount dynamics by month & gender (stacked) ----
  const popOption = useMemo(() => {
    const men = [13, 11, 11, 17, 16, 12, 8, 21, 8, 11, 7, 21];
    const women = [9, 10, 12, 12, 15, 9, 8, 17, 14, 13, 10, 12];
    const share = popMode === "share";
    const menData = share ? men.map((v, i) => +((v / (v + women[i])) * 100).toFixed(1)) : men;
    const womenData = share ? women.map((v, i) => +((v / (men[i] + v)) * 100).toFixed(1)) : women;
    const fmt = (v: number) => (share ? fmtPct(v) : fmtInt(v) + " чел.");
    return {
      grid: grid({ top: 34, right: 18 }),
      legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmt(v) },
      xAxis: { ...catAxis(MONTHS), axisLabel: { ...axisLabel, hideOverlap: true } },
      yAxis: {
        ...moneyAxis,
        max: share ? 100 : undefined,
        axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => (share ? v + "%" : fmtInt(v)) },
      },
      series: [
        { name: "Мужчины", type: "bar", stack: "pop", barWidth: "56%", emphasis: { focus: "series" as const }, itemStyle: { color: MEN, borderRadius: [0, 0, 0, 0] }, data: menData },
        { name: "Женщины", type: "bar", stack: "pop", barWidth: "56%", emphasis: { focus: "series" as const }, itemStyle: { color: WOMEN, borderRadius: [4, 4, 0, 0] }, data: womenData },
      ],
    };
  }, [popMode]);

  // ---- B. Age structure by gender (grouped) ----
  const ageOption = useMemo(() => {
    const bands = ["до 30", "31–40", "41–50", "51–60", "старше 60"];
    return {
      grid: grid({ top: 34, right: 18 }),
      legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtInt(v) + " чел." },
      xAxis: { ...catAxis(bands), axisLabel: { ...axisLabel, hideOverlap: true } },
      yAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtInt(v) } },
      series: [
        { name: "Мужчины", type: "bar", barWidth: "34%", emphasis: { focus: "series" as const }, itemStyle: { color: MEN, borderRadius: [4, 4, 0, 0] }, data: [2, 31, 35, 26, 40] },
        { name: "Женщины", type: "bar", barWidth: "34%", emphasis: { focus: "series" as const }, itemStyle: { color: WOMEN, borderRadius: [4, 4, 0, 0] }, data: [2, 24, 26, 22, 32] },
      ],
    };
  }, []);

  // ---- Reusable horizontal grouped-bar builder for people counts ----
  const peopleBars = (cats: string[], men: number[], women: number[]) => ({
    grid: grid({ top: 30, right: 40, left: 8 }),
    legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtInt(v) + " чел." },
    xAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtInt(v) } },
    yAxis: { ...catAxis(cats), axisLabel: { ...axisLabel, hideOverlap: true } },
    series: [
      { name: "Мужчины", type: "bar" as const, barWidth: "32%", emphasis: { focus: "series" as const }, itemStyle: { color: MEN, borderRadius: [0, 4, 4, 0] }, labelLayout: { hideOverlap: true }, label: { show: true, position: "right" as const, formatter: (p: any) => fmtInt(p.value), fontSize: 10, color: MUTED, fontWeight: 600 }, data: men },
      { name: "Женщины", type: "bar" as const, barWidth: "32%", emphasis: { focus: "series" as const }, itemStyle: { color: WOMEN, borderRadius: [0, 4, 4, 0] }, labelLayout: { hideOverlap: true }, label: { show: true, position: "right" as const, formatter: (p: any) => fmtInt(p.value), fontSize: 10, color: MUTED, fontWeight: 600 }, data: women },
    ],
  });

  // ---- C. Gender by branch (horizontal grouped) ----
  const branchOption = useMemo(
    () => peopleBars(["Montevideo", "Lima", "Buenos Aires"], [36, 53, 53], [43, 39, 37]),
    []
  );

  // ---- D. Gender by division (horizontal grouped) ----
  const divisionOption = useMemo(
    () => peopleBars(["Продажи", "Руководство", "ИТ/ИС", "Админ.", "Производство"], [16, 6, 27, 15, 73], [8, 0, 22, 15, 77]),
    []
  );

  // ---- E. Average salary by division & gender (horizontal grouped, тыс. $) ----
  const salaryOption = useMemo(() => {
    const cats = ["Продажи", "Производство", "Руководство", "ИТ/ИС", "Админ."];
    return {
      grid: grid({ top: 30, right: 56, left: 8 }),
      legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => usdK(v) },
      xAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => v + " тыс." } },
      yAxis: { ...catAxis(cats), axisLabel: { ...axisLabel, hideOverlap: true } },
      series: [
        { name: "Мужчины", type: "bar" as const, barWidth: "32%", emphasis: { focus: "series" as const }, itemStyle: { color: MEN, borderRadius: [0, 4, 4, 0] }, labelLayout: { hideOverlap: true }, label: { show: true, position: "right" as const, formatter: (p: any) => usdK(p.value), fontSize: 10, color: MUTED, fontWeight: 600 }, data: [67, 68, 164, 75, 80] },
        { name: "Женщины", type: "bar" as const, barWidth: "32%", emphasis: { focus: "series" as const }, itemStyle: { color: WOMEN, borderRadius: [0, 4, 4, 0] }, labelLayout: { hideOverlap: true }, label: { show: true, position: "right" as const, formatter: (p: any) => usdK(p.value), fontSize: 10, color: MUTED, fontWeight: 600 }, data: [65, 71, 0, 66, 57] },
      ],
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Разнообразие и инклюзия"
        subtitle="Гендерное представительство, равенство в руководстве и разнообразие персонала"
        right={
          <Select
            label="Год"
            value={year}
            onChange={setYear}
            options={[{ value: "2024", label: "2024" }, { value: "2023", label: "2023" }, { value: "2022", label: "2022" }]}
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Женщины в штате" count={138} format={fmtInt} delta={7.1} deltaGood hint="активные сотрудники" accent={PURPLE} />
        <StatTile label="Доля женщин" count={47.3} format={fmtPct} delta={7.1} deltaGood hint="от штата" accent={PINK} />
        <StatTile label="Женщины в руководстве" count={28.6} format={fmtPct} delta={4.2} deltaGood hint="руководящие роли" accent={PRIMARY} />
        <StatTile label="Гендерный разрыв оплаты" count={9.6} format={fmtPct} delta={0.8} deltaGood={false} hint="муж. vs жен." accent={RED} />
        <StatTile label="Индекс разнообразия" count={94.5} format={fmtPct} delta={1.2} deltaGood hint="сводный индекс" accent={POSITIVE} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Динамика персонала"
          description="по месяцам и полу"
          right={
            <Segmented
              size="sm"
              value={popMode}
              onChange={(v) => setPopMode(v as PopMode)}
              options={[{ value: "abs", label: "Человек" }, { value: "share", label: "Доля" }]}
            />
          }
        >
          <Chart option={popOption} height={300} />
        </ChartCard>
        <ChartCard title="Возрастная структура" description="по полу">
          <Chart option={ageOption} height={300} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Пол по филиалам" description="активные сотрудники">
          <Chart option={branchOption} height={300} />
        </ChartCard>
        <ChartCard title="Пол по подразделениям" description="активные сотрудники">
          <Chart option={divisionOption} height={300} />
        </ChartCard>
        <ChartCard title="Средняя зарплата" description="по подразделениям и полу (тыс. $)">
          <Chart option={salaryOption} height={300} />
        </ChartCard>
      </div>
    </>
  );
}
