"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtInt, fmtPct } from "@/lib/format";
import { grid, tooltipBox, moneyAxis, catAxis, axisLabel, PALETTE, PRIMARY, PURPLE, RED, PINK, POSITIVE, MUTED, INK, hexA, vGradient, hGradient } from "@/lib/chart";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

// Salaries below are in thousands of USD (70.5 -> "$70,5 тыс.").
const usdK = (n: number) => "$" + n.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + " тыс.";

// Two-tone gender palette (matches the source board).
const MALE = PURPLE; // #7C3AED
const FEMALE = "#C4B5FD"; // light violet
const PRIOR = "#C7D2FE"; // light indigo — prior-year comparison

type GenderView = "gender" | "age";
type SalaryView = "total" | "byGender";

export default function HrPage() {
  const [year, setYear] = useState("2024");
  const [genderView, setGenderView] = useState<GenderView>("gender");
  const [salaryView, setSalaryView] = useState<SalaryView>("total");

  // ---- Row 1A: headcount dynamics by month, current vs prior year ----
  const dynamicsOption = useMemo(() => {
    const current = [22, 21, 24, 29, 31, 21, 16, 37, 22, 24, 17, 32];
    const prior = [16, 16, 22, 24, 24, 18, 11, 31, 18, 20, 14, 28];
    return {
      grid: grid({ top: 34, right: 18 }),
      legend: { data: ["Персонал", "Прошлый год"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtInt(v) + " чел." },
      xAxis: { ...catAxis(MONTHS), axisLabel: { ...axisLabel, hideOverlap: true } },
      yAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtInt(v) } },
      series: [
        { name: "Персонал", type: "bar", barWidth: "38%", data: current, emphasis: { focus: "series" as const }, itemStyle: { color: vGradient(hexA(PRIMARY, 0.9), PURPLE), borderRadius: [4, 4, 0, 0] } },
        { name: "Прошлый год", type: "bar", barWidth: "38%", data: prior, emphasis: { focus: "series" as const }, itemStyle: { color: PRIOR, borderRadius: [4, 4, 0, 0] } },
      ],
    };
  }, []);

  // ---- Row 1B: gender split donut with a gender/age toggle ----
  const splitOption = useMemo(() => {
    const genderData = [
      { name: "Мужчины", value: 106, itemStyle: { color: MALE } },
      { name: "Женщины", value: 133, itemStyle: { color: FEMALE } },
    ];
    const ageGroups = ["до 30", "31–40", "41–50", "51–60", "старше 60"];
    const ageValues = [18, 86, 71, 40, 24];
    const ageData = ageGroups.map((name, i) => ({ name, value: ageValues[i], itemStyle: { color: PALETTE[i] } }));
    const data = genderView === "gender" ? genderData : ageData;
    const total = data.reduce((a, b) => a + b.value, 0);
    return {
      tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${p.name}<br/><b>${fmtInt(p.value)} чел.</b> · ${fmtPct(p.percent ?? 0)}` },
      legend: { orient: "vertical" as const, right: 0, top: "center", icon: "circle", textStyle: { fontSize: 11, color: MUTED } },
      title: {
        text: fmtInt(total),
        subtext: "всего",
        left: "34%",
        top: "center",
        textAlign: "center" as const,
        textStyle: { fontSize: 22, fontWeight: 700, color: INK },
        subtextStyle: { fontSize: 11, color: MUTED },
      },
      series: [
        {
          type: "pie",
          radius: ["45%", "70%"],
          center: ["34%", "50%"],
          avoidLabelOverlap: true,
          data,
          label: { show: true, formatter: (p: any) => `${fmtPct(p.percent ?? 0)}`, fontSize: 11, color: INK, fontWeight: 600 },
          labelLayout: { hideOverlap: true },
          labelLine: { length: 8, length2: 8 },
          emphasis: { scale: true, scaleSize: 6, itemStyle: { shadowBlur: 16, shadowColor: hexA(PURPLE, 0.3) } },
          itemStyle: { borderColor: "#fff", borderWidth: 2 },
        },
      ],
    };
  }, [genderView]);

  // ---- Row 2C: headcount by branch, current vs prior year (horizontal grouped) ----
  const branchOption = useMemo(() => {
    // Category order bottom→top; Lima ends on top.
    const branches = ["Montevideo", "Buenos Aires", "Lima"];
    const active = [79, 90, 92];
    const prior = [62, 81, 79];
    return {
      grid: grid({ top: 34, right: 40, left: 8 }),
      legend: { data: ["Активные", "Прошлый год"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtInt(v) + " чел." },
      xAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtInt(v) } },
      yAxis: { ...catAxis(branches), axisLabel: { ...axisLabel, hideOverlap: true } },
      series: [
        { name: "Активные", type: "bar", barWidth: "34%", data: active, emphasis: { focus: "series" as const }, itemStyle: { color: hGradient(hexA(PRIMARY, 0.9), PURPLE), borderRadius: [0, 4, 4, 0] } },
        { name: "Прошлый год", type: "bar", barWidth: "34%", data: prior, emphasis: { focus: "series" as const }, itemStyle: { color: PRIOR, borderRadius: [0, 4, 4, 0] } },
      ],
    };
  }, []);

  // ---- Row 2D: headcount distribution by department (horizontal, value + %) ----
  const deptOption = useMemo(() => {
    // Given descending; reverse so the largest sits on top.
    const rows = [
      { name: "Производство", value: 150 },
      { name: "ИТ/ИС", value: 49 },
      { name: "Продажи", value: 24 },
      { name: "Админ.", value: 10 },
      { name: "Руководство", value: 6 },
    ];
    const total = rows.reduce((a, b) => a + b.value, 0);
    const disp = [...rows].reverse();
    return {
      grid: grid({ top: 12, right: 78, left: 8 }),
      tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${p.name}<br/><b>${fmtInt(p.value)} чел.</b> · ${fmtPct((p.value / total) * 100)}` },
      xAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtInt(v) } },
      yAxis: { ...catAxis(disp.map((d) => d.name)), axisLabel: { ...axisLabel, hideOverlap: true } },
      series: [
        {
          type: "bar",
          barWidth: "58%",
          data: disp.map((d) => d.value),
          itemStyle: { color: hGradient(hexA(PRIMARY, 0.9), PURPLE), borderRadius: [0, 6, 6, 0] },
          emphasis: { focus: "series" as const },
          labelLayout: { hideOverlap: true },
          label: { show: true, position: "right", formatter: (p: any) => `${fmtInt(p.value)} (${fmtPct((p.value / total) * 100)})`, fontSize: 11, color: MUTED, fontWeight: 600 },
        },
      ],
    };
  }, []);

  // ---- Row 2E: average salary by department (thousands $), total / by gender toggle ----
  const salaryOption = useMemo(() => {
    // Given order: Руководство, ИТ/ИС, Админ, Производство, Продажи.
    const rows = [
      { name: "Руководство", total: 164.1, m: 164, f: 0 },
      { name: "ИТ/ИС", total: 73.1, m: 75, f: 71 },
      { name: "Админ.", total: 70.0, m: 80, f: 57 },
      { name: "Производство", total: 67.1, m: 68, f: 66 },
      { name: "Продажи", total: 66.4, m: 67, f: 65 },
    ];
    // Reverse so the highest-paid department sits on top.
    const disp = [...rows].reverse();
    const salaryLabel = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + " тыс.";
    const base = {
      grid: grid({ top: 34, right: 70, left: 8 }),
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => usdK(v) },
      xAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => salaryLabel(v) } },
      yAxis: { ...catAxis(disp.map((d) => d.name)), axisLabel: { ...axisLabel, hideOverlap: true } },
    };
    if (salaryView === "byGender") {
      return {
        ...base,
        legend: { data: ["Мужчины", "Женщины"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
        series: [
          { name: "Мужчины", type: "bar", barWidth: "32%", data: disp.map((d) => d.m), emphasis: { focus: "series" as const }, itemStyle: { color: MALE, borderRadius: [0, 4, 4, 0] } },
          { name: "Женщины", type: "bar", barWidth: "32%", data: disp.map((d) => d.f), emphasis: { focus: "series" as const }, itemStyle: { color: FEMALE, borderRadius: [0, 4, 4, 0] } },
        ],
      };
    }
    return {
      ...base,
      legend: { show: false },
      series: [
        {
          type: "bar",
          barWidth: "58%",
          data: disp.map((d) => d.total),
          itemStyle: { color: hGradient(hexA(PRIMARY, 0.9), PURPLE), borderRadius: [0, 6, 6, 0] },
          emphasis: { focus: "series" as const },
          labelLayout: { hideOverlap: true },
          label: { show: true, position: "right", formatter: (p: any) => salaryLabel(p.value), fontSize: 11, color: MUTED, fontWeight: 600 },
        },
      ],
    };
  }, [salaryView]);

  return (
    <>
      <PageHeader
        title="Обзор персонала"
        subtitle="Состав персонала, динамика численности и организационная структура"
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
        <StatTile label="Всего сотрудников" count={292} format={fmtInt} delta={22.7} accent={PRIMARY} hint="Пр. год: 238" />
        <StatTile label="Активные сотрудники" count={239} format={fmtInt} delta={19.5} accent={PURPLE} hint="Пр. год: 200" />
        <StatTile label="Текучесть" count={24.3} format={fmtPct} delta={3.3} deltaGood={false} accent={RED} hint="Пр. год: 23,5%" />
        <StatTile label="Женщины в штате" count={47.3} format={fmtPct} delta={7.1} accent={PINK} hint="Пр. год: 44,1%" />
        <StatTile label="Ср. годовая зарплата" count={70.5} format={usdK} delta={0.19} accent={POSITIVE} hint="Пр. год: $70,41 тыс." />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Динамика персонала" description="по месяцам (текущий год vs прошлый)">
          <Chart option={dynamicsOption} height={300} />
        </ChartCard>
        <ChartCard
          title="Разделение персонала"
          description="по полу"
          right={
            <Segmented
              size="sm"
              value={genderView}
              onChange={(v) => setGenderView(v as GenderView)}
              options={[{ value: "gender", label: "Пол" }, { value: "age", label: "Возраст" }]}
            />
          }
        >
          <Chart option={splitOption} height={300} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Персонал по филиалам" description="сравнение: текущий vs прошлый год">
          <Chart option={branchOption} height={300} />
        </ChartCard>
        <ChartCard title="Распределение персонала" description="по подразделениям">
          <Chart option={deptOption} height={300} />
        </ChartCard>
        <ChartCard
          title="Средняя зарплата"
          description="по подразделениям (₸ → тыс. $)"
          right={
            <Segmented
              size="sm"
              value={salaryView}
              onChange={(v) => setSalaryView(v as SalaryView)}
              options={[{ value: "total", label: "Всего" }, { value: "byGender", label: "По полу" }]}
            />
          }
        >
          <Chart option={salaryOption} height={300} />
        </ChartCard>
      </div>
    </>
  );
}
