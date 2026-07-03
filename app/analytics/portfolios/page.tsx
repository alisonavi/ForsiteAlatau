"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtTenge, fmtPct, fmtShort } from "@/lib/format";
import { grid, tooltipBox, moneyAxis, axisLabel, PALETTE, PRIMARY, PURPLE, TEAL, GOLD, POSITIVE, MUTED, GRID, INK, EMPHASIS, SELECTED, vGradient, hexA } from "@/lib/chart";
import { rand, trendSeries, splitTotal } from "@/lib/rng";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const QUARTERS = ["I кв", "II кв", "III кв", "IV кв"];
const SEG_NAMES = ["Розница", "МСБ", "Корпоратив"];
const SEG_COLORS = [PALETTE[0], PALETTE[1], PALETTE[3]];

const TREE_NAMES = [
  "Ипотека",
  "Потреб. кредиты",
  "Кредитные карты",
  "Автокредиты",
  "Кредиты МСБ",
  "Корп. кредиты",
  "Депозиты физлиц",
  "Депозиты юрлиц",
];

export default function PortfoliosPage() {
  const [segment, setSegment] = useState("Все");
  const [year, setYear] = useState("2024");

  const seg = segment + "-" + year;

  // ---- KPI (seeded by segment + year) ----
  const kpi = useMemo(() => {
    const segScale = segment === "Все" ? 1 : segment === "Розница" ? 0.42 : segment === "МСБ" ? 0.24 : 0.34;
    const yearK = year === "2024" ? 1 : year === "2023" ? 0.9 : 0.82;
    const r = rand("port-kpi-" + seg);
    const credit = Math.round(1240e9 * segScale * yearK);
    const deposit = Math.round(1560e9 * segScale * yearK);
    return {
      credit,
      deposit,
      npl: +r.range(4.5, 8.5).toFixed(1),
      coverage: +r.range(92, 116).toFixed(1),
      creditDelta: +r.range(6, 14).toFixed(1),
      depositDelta: +r.range(4, 12).toFixed(1),
      nplDelta: -+r.range(0.4, 1.8).toFixed(1),
      coverageDelta: +r.range(1, 6).toFixed(1),
    };
  }, [segment, year, seg]);

  // ---- 1. Treemap: структура по продуктам ----
  const tree = useMemo(() => {
    const total = kpi.credit + kpi.deposit;
    const parts = splitTotal("port-tree-" + seg, total, TREE_NAMES.length);
    const treeTotal = parts.reduce((a, b) => a + b, 0);
    const data = TREE_NAMES.map((name, i) => ({
      name,
      value: parts[i],
      itemStyle: { color: PALETTE[i % PALETTE.length] },
    }));
    return { data, treeTotal };
  }, [seg, kpi.credit, kpi.deposit]);

  const treemapOption = {
    tooltip: {
      ...tooltipBox,
      trigger: "item",
      formatter: (p: any) => `${p.name}<br/><b>${fmtTenge(p.value)}</b> (${((p.value / tree.treeTotal) * 100).toFixed(1)}%)`,
    },
    series: [
      {
        type: "treemap",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: { show: true, formatter: "{b}", color: "#fff", fontSize: 11 },
        itemStyle: { borderColor: "#fff", borderWidth: 2, gapWidth: 2 },
        levels: [{ itemStyle: { gapWidth: 2 } }],
        emphasis: { focus: "self" },
        data: tree.data,
      },
    ],
  };

  // ---- 2. 100% stacked bar: структура по сегментам (по кварталам) ----
  const stack = useMemo(() => {
    const rr = trendSeries("port-stk-ret-" + seg, 4, { start: 46, growth: 0.004, noise: 0.06, min: 30 });
    const rs = trendSeries("port-stk-smb-" + seg, 4, { start: 22, growth: 0.01, noise: 0.08, min: 12 });
    const rc = trendSeries("port-stk-corp-" + seg, 4, { start: 32, growth: 0.006, noise: 0.07, min: 18 });
    return QUARTERS.map((_, i) => {
      const s = rr[i] + rs[i] + rc[i];
      return [+((rr[i] / s) * 100).toFixed(1), +((rs[i] / s) * 100).toFixed(1), +((rc[i] / s) * 100).toFixed(1)];
    });
  }, [seg]);

  const stackOption = {
    grid: grid({ top: 34, right: 18 }),
    legend: { data: SEG_NAMES, top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtPct(v) },
    xAxis: { type: "category", data: QUARTERS, axisTick: { show: false }, axisLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11 } },
    yAxis: { type: "value", max: 100, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } }, axisLabel: { ...axisLabel, formatter: (v: number) => v + "%" } },
    series: SEG_NAMES.map((name, si) => ({
      name,
      type: "bar",
      stack: "s",
      barWidth: "46%",
      emphasis: { focus: "series" },
      data: stack.map((row) => row[si]),
      itemStyle: { color: SEG_COLORS[si], borderRadius: si === SEG_NAMES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0] },
    })),
  };

  // ---- 3. Dual-axis combo: объём портфеля (₸) + NPL (%) по месяцам ----
  const combo = useMemo(() => {
    const volume = trendSeries("port-vol-" + seg, 12, { start: kpi.credit * 0.92, growth: 0.008, noise: 0.03 });
    const nplRaw = trendSeries("port-npl-" + seg, 12, { start: kpi.npl * 115, growth: -0.01, noise: 0.05, min: 200 });
    const npl = nplRaw.map((v) => +(v / 100).toFixed(2));
    return { volume, npl };
  }, [seg, kpi.credit, kpi.npl]);

  const comboOption = {
    grid: grid({ top: 34, right: 46 }),
    legend: { data: ["Объём портфеля", "NPL 90+"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: {
      ...tooltipBox,
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (ps: any[]) =>
        `${ps[0].axisValueLabel}<br/>` +
        ps
          .map((p) => `${p.marker} ${p.seriesName}: <b>${p.seriesName === "NPL 90+" ? fmtPct(p.value) : fmtTenge(p.value)}</b>`)
          .join("<br/>"),
    },
    xAxis: { type: "category", data: MONTHS, axisTick: { show: false }, axisLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11 } },
    yAxis: [
      { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtShort(v) } },
      { type: "value", position: "right", splitLine: { show: false }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { ...axisLabel, formatter: (v: number) => fmtPct(v) } },
    ],
    series: [
      { name: "Объём портфеля", type: "bar", yAxisIndex: 0, barWidth: "52%", cursor: "pointer", selectedMode: "single", data: combo.volume, itemStyle: { borderRadius: [4, 4, 0, 0], color: vGradient(hexA(PRIMARY, 0.9), PURPLE) }, emphasis: EMPHASIS, select: SELECTED },
      { name: "NPL 90+", type: "line", yAxisIndex: 1, smooth: true, symbolSize: 6, emphasis: { focus: "series" }, data: combo.npl, lineStyle: { width: 3, color: GOLD }, itemStyle: { color: GOLD } },
    ],
  };

  // ---- 4. Sunburst: сегмент -> продукт ----
  const sun = useMemo(() => {
    const retK = splitTotal("port-sun-ret-" + seg, kpi.credit * 0.5, 3);
    const smbK = splitTotal("port-sun-smb-" + seg, kpi.credit * 0.25, 3);
    const corpK = splitTotal("port-sun-corp-" + seg, kpi.credit * 0.25, 3);
    return [
      {
        name: "Розница",
        itemStyle: { color: PALETTE[0] },
        children: [
          { name: "Ипотека", value: retK[0] },
          { name: "Потреб. кредиты", value: retK[1] },
          { name: "Карты", value: retK[2] },
        ],
      },
      {
        name: "МСБ",
        itemStyle: { color: PALETTE[1] },
        children: [
          { name: "Оборотные", value: smbK[0] },
          { name: "Инвест. кредиты", value: smbK[1] },
          { name: "Овердрафт", value: smbK[2] },
        ],
      },
      {
        name: "Корпоратив",
        itemStyle: { color: PALETTE[3] },
        children: [
          { name: "Проектное финанс.", value: corpK[0] },
          { name: "Торг. финанс.", value: corpK[1] },
          { name: "Синдиц. кредиты", value: corpK[2] },
        ],
      },
    ];
  }, [seg, kpi.credit]);

  const sunburstOption = {
    tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${p.name}<br/><b>${fmtTenge(p.value)}</b>` },
    series: [
      {
        type: "sunburst",
        radius: ["18%", "92%"],
        cursor: "pointer",
        selectedMode: "single",
        label: { rotate: "radial", fontSize: 10, color: "#fff" },
        itemStyle: { borderColor: "#fff", borderWidth: 2 },
        emphasis: { focus: "self", scaleSize: 8 },
        select: { itemStyle: { borderColor: INK, borderWidth: 2, shadowBlur: 18, shadowColor: hexA(PURPLE, 0.5) } },
        data: sun,
      },
    ],
  };

  return (
    <>
      <PageHeader
        title="Банковские портфели"
        subtitle="Структура и качество кредитного и депозитного портфелей Alatau City Bank"
        right={
          <>
            <Segmented
              value={segment}
              onChange={setSegment}
              options={[
                { value: "Все", label: "Все" },
                { value: "Розница", label: "Розница" },
                { value: "МСБ", label: "МСБ" },
                { value: "Корпоратив", label: "Корпоратив" },
              ]}
            />
            <Select
              value={year}
              onChange={setYear}
              options={[
                { value: "2024", label: "2024" },
                { value: "2023", label: "2023" },
                { value: "2022", label: "2022" },
              ]}
            />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Кредитный портфель" count={kpi.credit} format={fmtTenge} delta={kpi.creditDelta} accent={PRIMARY} />
        <StatTile label="Депозитный портфель" count={kpi.deposit} format={fmtTenge} delta={kpi.depositDelta} accent={TEAL} />
        <StatTile label="NPL 90+" count={kpi.npl} format={fmtPct} delta={kpi.nplDelta} deltaGood accent={GOLD} hint="Просрочка свыше 90 дней" />
        <StatTile label="Покрытие резервами" count={kpi.coverage} format={fmtPct} delta={kpi.coverageDelta} accent={POSITIVE} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <ChartCard className="lg:col-span-3" title="Структура портфеля по продуктам" description="Дерево распределения активов и обязательств по продуктам, ₸">
          <Chart option={treemapOption} height={340} />
        </ChartCard>
        <ChartCard className="lg:col-span-2" title="Структура портфеля по сегментам" description="Доли Розницы, МСБ и Корпоратива по кварталам, 100%">
          <Chart option={stackOption} height={340} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Объём портфеля и NPL" description="Помесячно: объём портфеля (₸) и доля проблемных кредитов (NPL 90+)">
          <Chart option={comboOption} height={300} />
        </ChartCard>
        <ChartCard title="Портфель: сегмент → продукт" description="Иерархия кредитного портфеля по сегментам и продуктам, ₸">
          <Chart option={sunburstOption} height={300} />
        </ChartCard>
      </div>
    </>
  );
}
