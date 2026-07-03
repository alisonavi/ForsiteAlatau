"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtInt, fmtPct, fmtTenge } from "@/lib/format";
import { PALETTE, PRIMARY, PURPLE, RED, POSITIVE, INK, MUTED, GRID, SELECTED, grid, tooltipBox, moneyAxis, catAxis, vGradient, hexA } from "@/lib/chart";
import { rand, splitTotal, trendSeries } from "@/lib/rng";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const QUARTERS = ["1 кв.", "2 кв.", "3 кв.", "4 кв."];

export default function ProductsPage() {
  const [seg, setSeg] = useState("Все");
  const [year, setYear] = useState("2024");

  const key = seg + "-" + year;

  // ---- KPI ----
  const kpi = useMemo(() => {
    const r = rand("prod-kpi-" + key);
    return {
      perClient: r.range(2.4, 3.1),
      crossSell: r.range(29, 45),
      digital: r.range(54, 73),
      nps: r.int(57, 67),
      dPerClient: r.range(-1.5, 5.5),
      dCross: r.range(0.5, 6.5),
      dDigital: r.range(1.5, 8),
      dNps: r.range(-2, 5),
    };
  }, [key]);

  // ---- 1. Rose / Nightingale: продуктовый микс ----
  const mixNames = ["Дебетовые карты", "Кредитные карты", "Ипотека", "Депозиты", "Автокредиты", "Инвестиции"];
  const mixVals = useMemo(() => splitTotal("prod-mix-" + key, 480, 6), [key]);
  const roseOption = {
    tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${p.name}<br/><b>${fmtInt(p.value)} тыс.</b> (${p.percent}%)` },
    legend: { bottom: 0, icon: "circle", itemGap: 12, textStyle: { fontSize: 10, color: MUTED } },
    series: [
      {
        type: "pie",
        roseType: "area",
        radius: ["18%", "78%"],
        center: ["50%", "46%"],
        cursor: "pointer",
        selectedMode: "single",
        itemStyle: { borderColor: "#fff", borderWidth: 2, borderRadius: 4 },
        label: { fontSize: 10, color: INK, formatter: "{b}" },
        labelLayout: { hideOverlap: true },
        labelLine: { length: 6, length2: 8 },
        emphasis: { focus: "self", scaleSize: 8 },
        select: SELECTED,
        data: mixNames.map((name, i) => ({ name, value: mixVals[i], itemStyle: { color: PALETTE[i] } })),
      },
    ],
  };

  // ---- 2. Sankey: кросс-продажи (переток клиентов) ----
  const flow = useMemo(() => {
    const r = rand("prod-flow-" + key);
    return {
      zpCard: r.int(92, 112),
      cardDep: r.int(40, 56),
      cardCred: r.int(30, 46),
      depInv: r.int(12, 22),
      credInv: r.int(8, 15),
    };
  }, [key]);
  const sankeyOption = {
    tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => (p.dataType === "edge" ? `${p.data.source} → ${p.data.target}<br/><b>${fmtInt(p.data.value)} тыс. клиентов</b>` : `<b>${p.name}</b>`) },
    series: [
      {
        type: "sankey",
        left: 12,
        right: 24,
        top: 10,
        bottom: 10,
        nodeGap: 16,
        nodeWidth: 12,
        emphasis: { focus: "adjacency" },
        lineStyle: { color: "gradient", opacity: 0.4, curveness: 0.5 },
        label: { fontSize: 10, color: INK },
        data: [
          { name: "Зарплатный проект", itemStyle: { color: PALETTE[0] } },
          { name: "Дебетовая карта", itemStyle: { color: PALETTE[1] } },
          { name: "Депозит", itemStyle: { color: PALETTE[3] } },
          { name: "Кредит", itemStyle: { color: PALETTE[4] } },
          { name: "Инвестиции", itemStyle: { color: PALETTE[2] } },
        ],
        links: [
          { source: "Зарплатный проект", target: "Дебетовая карта", value: flow.zpCard },
          { source: "Дебетовая карта", target: "Депозит", value: flow.cardDep },
          { source: "Дебетовая карта", target: "Кредит", value: flow.cardCred },
          { source: "Депозит", target: "Инвестиции", value: flow.depInv },
          { source: "Кредит", target: "Инвестиции", value: flow.credInv },
        ],
      },
    ],
  };

  // ---- 3. Grouped bar: продажи по продуктам по кварталам (₸) ----
  const salesCredit = useMemo(() => trendSeries("prod-sale-cred-" + key, 4, { start: 42e9, growth: 0.05, noise: 0.08 }), [key]);
  const salesDepo = useMemo(() => trendSeries("prod-sale-depo-" + key, 4, { start: 58e9, growth: 0.03, noise: 0.06 }), [key]);
  const salesDigi = useMemo(() => trendSeries("prod-sale-digi-" + key, 4, { start: 24e9, growth: 0.08, noise: 0.1 }), [key]);
  const barOption = {
    grid: grid({ top: 34, right: 18 }),
    legend: { data: ["Кредиты", "Депозиты", "Цифровые"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => fmtTenge(v) },
    xAxis: { ...catAxis(QUARTERS), axisLabel: { ...catAxis(QUARTERS).axisLabel, hideOverlap: true } },
    yAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => fmtTenge(v) } },
    series: [
      { name: "Кредиты", type: "bar", barGap: "12%", barWidth: "20%", data: salesCredit, itemStyle: { borderRadius: [4, 4, 0, 0], color: vGradient(PRIMARY, hexA(PRIMARY, 0.55)) }, emphasis: { focus: "series" } },
      { name: "Депозиты", type: "bar", barWidth: "20%", data: salesDepo, itemStyle: { borderRadius: [4, 4, 0, 0], color: vGradient(PURPLE, hexA(PURPLE, 0.55)) }, emphasis: { focus: "series" } },
      { name: "Цифровые", type: "bar", barWidth: "20%", data: salesDigi, itemStyle: { borderRadius: [4, 4, 0, 0], color: vGradient(RED, hexA(RED, 0.55)) }, emphasis: { focus: "series" } },
    ],
  };

  // ---- 4. Line: проникновение продуктов по месяцам (%) ----
  const penDigital = useMemo(() => trendSeries("prod-pen-digi-" + key, 12, { start: 52, growth: 0.012, noise: 0.03 }), [key]);
  const penCards = useMemo(() => trendSeries("prod-pen-card-" + key, 12, { start: 61, growth: 0.006, noise: 0.02 }), [key]);
  const penCredit = useMemo(() => trendSeries("prod-pen-cred-" + key, 12, { start: 34, growth: 0.01, noise: 0.035 }), [key]);
  const penLine = (name: string, data: number[], color: string) => ({
    name,
    type: "line" as const,
    smooth: true,
    symbolSize: 6,
    showSymbol: false,
    data: data.map((v) => Math.min(96, v)),
    lineStyle: { width: 3, color },
    itemStyle: { color },
    areaStyle: { color: vGradient(hexA(color, 0.24), hexA(color, 0)) },
    emphasis: { focus: "series" as const },
  });
  const lineOption = {
    grid: grid({ top: 34, right: 18 }),
    legend: { data: ["Цифровой банк", "Карты", "Кредиты"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", valueFormatter: (v: number) => fmtPct(v) },
    xAxis: { ...catAxis(MONTHS), boundaryGap: false, axisLabel: { ...catAxis(MONTHS).axisLabel, hideOverlap: true } },
    yAxis: { type: "value", max: 100, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11, formatter: (v: number) => fmtPct(v, 0) } },
    series: [penLine("Цифровой банк", penDigital, PRIMARY), penLine("Карты", penCards, PURPLE), penLine("Кредиты", penCredit, RED)],
  };

  return (
    <>
      <PageHeader
        title="Продукты"
        subtitle="Продуктовый портфель, продажи и кросс-продажи Alatau City Bank"
        right={
          <>
            <Segmented
              value={seg}
              onChange={setSeg}
              size="sm"
              options={[
                { value: "Все", label: "Все" },
                { value: "Карты", label: "Карты" },
                { value: "Кредиты", label: "Кредиты" },
                { value: "Депозиты", label: "Депозиты" },
                { value: "Цифровые", label: "Цифровые" },
              ]}
            />
            <Select value={year} onChange={setYear} options={[{ value: "2024", label: "2024" }, { value: "2023", label: "2023" }]} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Активных продуктов на клиента" count={kpi.perClient} format={(n) => n.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} delta={kpi.dPerClient} accent={PRIMARY} hint="в среднем на клиента" />
        <StatTile label="Cross-sell ratio" count={kpi.crossSell} format={(n) => fmtPct(n)} delta={kpi.dCross} accent={PURPLE} />
        <StatTile label="Проникновение цифровых" count={kpi.digital} format={(n) => fmtPct(n)} delta={kpi.dDigital} accent={RED} />
        <StatTile label="NPS" count={kpi.nps} format={fmtInt} delta={kpi.dNps} accent={POSITIVE} hint="индекс лояльности" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Продуктовый микс" description="Доля активных продуктов в портфеле — роза Найтингейла">
          <Chart option={roseOption} height={340} />
        </ChartCard>
        <ChartCard title="Кросс-продажи (переток клиентов)" description="Путь клиента: зарплатный проект → карта → депозит/кредит → инвестиции">
          <Chart option={sankeyOption} height={340} mobileHeight={320} />
        </ChartCard>
        <ChartCard title="Продажи по продуктам" description="Поквартальный объём продаж по ключевым продуктам, ₸">
          <Chart option={barOption} height={300} />
        </ChartCard>
        <ChartCard title="Проникновение продуктов" description="Помесячная динамика охвата клиентской базы, %">
          <Chart option={lineOption} height={300} />
        </ChartCard>
      </div>
    </>
  );
}
