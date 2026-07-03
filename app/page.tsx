"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import StatTile from "@/components/ui/StatTile";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import { Segmented, Select } from "@/components/ui/Controls";
import BranchesMap from "@/components/map/BranchesMap";
import { regionMetrics, type RegionMetric } from "@/lib/regions";
import { fmtInt, fmtShort, fmtTenge } from "@/lib/format";
import { PRIMARY, PURPLE, EMPHASIS, SELECTED, grid, moneyAxis, tooltipBox, vGradient, hexA } from "@/lib/chart";
import { trendSeries } from "@/lib/rng";

type MapMetric = "deposits" | "loans" | "clients" | "branches";

const MAP_METRICS: Record<
  MapMetric,
  { label: string; get: (m: RegionMetric) => number; fmt: (n: number) => string }
> = {
  deposits: { label: "Депозиты", get: (m) => m.deposits, fmt: fmtTenge },
  loans: { label: "Кредитный портфель", get: (m) => m.loans, fmt: fmtTenge },
  clients: { label: "Клиенты", get: (m) => m.clients, fmt: fmtInt },
  branches: { label: "Филиалы", get: (m) => m.branches, fmt: (n) => fmtInt(n) },
};

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const NAV_CARDS = [
  {
    title: "Форсайт-радар",
    desc: "Матрица продуктов и сегментов: рост vs маржинальность",
    href: "/radar",
    accent: "#2563EB",
  },
  {
    title: "Финансовые показатели",
    desc: "Доходы, расходы, прибыль, активы и структура баланса",
    href: "/analytics/financial",
    accent: "#7C3AED",
  },
  {
    title: "Продукты и портфели",
    desc: "Кредиты, депозиты, карты — динамика и структура",
    href: "/analytics/products",
    accent: "#F23C50",
  },
  {
    title: "Налоги по филиалам",
    desc: "Налоговые отчисления в разрезе регионов и филиалов",
    href: "/analytics/taxes",
    accent: "#EC4899",
  },
];

export default function DashboardPage() {
  const metrics = useMemo(() => regionMetrics(), []);
  const [period, setPeriod] = useState("2024");
  const [mapMetric, setMapMetric] = useState<MapMetric>("deposits");
  const [selected, setSelected] = useState<number | null>(null);

  const factor = period === "2024" ? 1 : period === "2023" ? 0.9 : 0.81;

  const totals = useMemo(() => {
    const deposits = metrics.reduce((s, m) => s + m.deposits, 0) * factor;
    const loans = metrics.reduce((s, m) => s + m.loans, 0) * factor;
    const clients = metrics.reduce((s, m) => s + m.clients, 0);
    const branches = metrics.reduce((s, m) => s + m.branches, 0);
    const assets = deposits * 1.32;
    const profit = assets * 0.021;
    return { deposits, loans, clients, branches, assets, profit };
  }, [metrics, factor]);

  const active = MAP_METRICS[mapMetric];
  const selectedRegion = selected != null ? metrics.find((m) => m.region.index === selected) : null;

  // ---- trend chart (assets vs profit, 12 months) ----
  const assetsSeries = useMemo(
    () => trendSeries("dash-assets-" + period, 12, { start: totals.assets / 12, growth: 0.012, noise: 0.05 }),
    [period, totals.assets]
  );
  const profitSeries = useMemo(
    () => trendSeries("dash-profit-" + period, 12, { start: totals.profit / 12, growth: 0.02, noise: 0.12 }),
    [period, totals.profit]
  );

  const trendOption = {
    grid: grid({ top: 30, right: 20 }),
    legend: { data: ["Активы", "Чистая прибыль"], right: 0, top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", valueFormatter: (v: number) => fmtTenge(v) },
    xAxis: { type: "category", data: MONTHS, boundaryGap: false, axisTick: { show: false }, axisLine: { lineStyle: { color: "#EEF1F7" } }, axisLabel: { color: "#64748B", fontSize: 11 } },
    yAxis: [{ ...moneyAxis }, { ...moneyAxis, position: "right", splitLine: { show: false } }],
    series: [
      {
        name: "Активы",
        type: "line",
        smooth: true,
        showSymbol: false,
        emphasis: { focus: "series" },
        lineStyle: { width: 3, color: PRIMARY },
        areaStyle: { color: vGradient(hexA(PRIMARY, 0.3), hexA(PRIMARY, 0)) },
        data: assetsSeries,
      },
      {
        name: "Чистая прибыль",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        emphasis: { focus: "series" },
        lineStyle: { width: 3, color: PURPLE },
        areaStyle: { color: vGradient(hexA(PURPLE, 0.22), hexA(PURPLE, 0)) },
        data: profitSeries,
      },
    ],
  };

  // ---- top regions bar ----
  const topRegions = useMemo(
    () => [...metrics].sort((a, b) => active.get(b) - active.get(a)).slice(0, 8).reverse(),
    [metrics, active]
  );
  const topOption = {
    grid: grid({ left: 6, right: 30 }),
    tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => active.fmt(v) },
    xAxis: { ...moneyAxis, axisLabel: { ...moneyAxis.axisLabel, formatter: (v: number) => active.fmt(v) } },
    yAxis: { type: "category", data: topRegions.map((m) => m.region.short), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: "#64748B", fontSize: 11 } },
    series: [
      {
        type: "bar",
        data: topRegions.map((m) => active.get(m)),
        barWidth: "58%",
        cursor: "pointer",
        selectedMode: "single",
        itemStyle: { borderRadius: [0, 6, 6, 0], color: vGradient(hexA(PRIMARY, 0.9), PURPLE) },
        emphasis: EMPHASIS,
        select: SELECTED,
        label: { show: true, position: "right", formatter: (p: any) => active.fmt(p.value), fontSize: 10, color: "#64748B" },
      },
    ],
  };

  return (
    <>
      <PageHeader
        title="Панель управления"
        subtitle="Ключевые показатели банка и филиальная сеть в реальном времени"
        right={
          <Select
            label="Период"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "2024", label: "2024 год" },
              { value: "2023", label: "2023 год" },
              { value: "2022", label: "2022 год" },
            ]}
          />
        }
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Активы" count={totals.assets} format={fmtTenge} delta={8.4} accent="#2563EB" />
        <StatTile label="Депозитный портфель" count={totals.deposits} format={fmtTenge} delta={6.1} accent="#7C3AED" />
        <StatTile label="Кредитный портфель" count={totals.loans} format={fmtTenge} delta={4.7} accent="#F23C50" />
        <StatTile label="Клиенты" count={totals.clients} format={fmtInt} delta={3.2} accent="#3B82F6" />
        <StatTile label="Чистая прибыль" count={totals.profit} format={fmtTenge} delta={11.5} accent="#16A34A" />
        <StatTile label="Филиалы" count={totals.branches} format={fmtInt} delta={1.4} accent="#EC4899" />
      </div>

      {/* Map + nav cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-3"
          title="Филиальная сеть по регионам Казахстана"
          description="Наведите на регион для детализации, нажмите — чтобы выбрать"
          right={
            <Segmented
              size="sm"
              value={mapMetric}
              onChange={(v) => setMapMetric(v as MapMetric)}
              options={[
                { value: "deposits", label: "Депозиты" },
                { value: "loans", label: "Кредиты" },
                { value: "clients", label: "Клиенты" },
                { value: "branches", label: "Филиалы" },
              ]}
            />
          }
        >
          <div className="h-[340px] md:h-[380px]">
            <BranchesMap
              data={metrics}
              valueLabel={active.label}
              getValue={active.get}
              format={active.fmt}
              selectedIndex={selected}
              onSelectRegion={setSelected}
            />
          </div>
          <div className="mt-3 rounded-xl bg-bank-primary-soft/40 p-3 transition-colors">
            {selectedRegion ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <p className="text-sm font-semibold text-bank-ink">{selectedRegion.region.name}</p>
                <Stat label="Депозиты" value={fmtTenge(selectedRegion.deposits)} />
                <Stat label="Кредиты" value={fmtTenge(selectedRegion.loans)} />
                <Stat label="Клиенты" value={fmtInt(selectedRegion.clients)} />
                <Stat label="Филиалы" value={String(selectedRegion.branches)} />
                <Stat label="Банкоматы" value={String(selectedRegion.atms)} />
              </div>
            ) : (
              <p className="text-xs text-bank-muted">
                Выберите регион на карте, чтобы увидеть депозиты, кредиты, число клиентов и филиалов.
              </p>
            )}
          </div>
        </ChartCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          {NAV_CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="acb-card group flex flex-col justify-between p-4 transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div>
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: c.accent + "1A", color: c.accent }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                    <path d="M4 20V4M4 20h16M8 16v-5M12 16V7M16 16v-8" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="mt-3 text-sm font-semibold text-bank-ink">{c.title}</p>
                <p className="mt-1 text-xs leading-snug text-bank-muted">{c.desc}</p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-bank-primary">
                Перейти
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                  <path fillRule="evenodd" d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L11.58 11H4a1 1 0 110-2h7.58L7.3 5.7a1 1 0 010-1.4z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Trend + top regions */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Динамика активов и прибыли" description="Помесячная динамика за выбранный период">
          <Chart option={trendOption} height={300} />
        </ChartCard>
        <ChartCard title={`ТОП-регионы · ${active.label}`} description="Нажмите на столбец — регион подсветится на карте выше">
          <Chart
            option={topOption}
            height={300}
            onEvents={{
              click: (p: any) => {
                const r = topRegions[p.dataIndex];
                if (r) setSelected((cur) => (cur === r.region.index ? null : r.region.index));
              },
            }}
          />
        </ChartCard>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-bank-muted">{label}</p>
      <p className="text-sm font-semibold text-bank-ink">{value}</p>
    </div>
  );
}
