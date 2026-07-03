"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import StatTile from "@/components/ui/StatTile";
import { Segmented, Select } from "@/components/ui/Controls";
import { fmtShort, fmtPct } from "@/lib/format";
import { grid, tooltipBox, moneyAxis, catAxis, PALETTE, PRIMARY, PURPLE, TEAL, GOLD, POSITIVE, GRID, MUTED, INK, hexA, vGradient, EMPHASIS, SELECTED } from "@/lib/chart";
import { rand, trendSeries } from "@/lib/rng";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const VERSIONS = ["v5.0", "v5.1", "v5.2", "v5.3", "v5.4", "v5.5", "v5.6"];

const dec1 = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function MobilePage() {
  const [platform, setPlatform] = useState("all");
  const [period, setPeriod] = useState("2024");
  const seed = platform + "-" + period;

  // ---- KPI scalars ----
  const kpi = useMemo(() => {
    const r = rand("mob-kpi-" + seed);
    const platShare = platform === "ios" ? 0.4 : platform === "android" ? 0.6 : 1;
    const periodK = period === "2024" ? 1 : 0.82;
    const mau = Math.round(1_420_000 * platShare * periodK * r.range(0.97, 1.03));
    const stickiness = r.range(0.31, 0.37);
    const dau = Math.round(mau * stickiness);
    const rating = r.range(4.55, 4.78);
    return { mau, dau, stickPct: (dau / mau) * 100, rating };
  }, [platform, period, seed]);

  // ---- 1. Funnel: онбординг ----
  const funnelOption = useMemo(() => {
    const f = rand("mob-funnel-" + seed);
    const reg = Math.round(f.range(68, 76));
    const kyc = Math.round(reg * f.range(0.72, 0.8));
    const firstOp = Math.round(kyc * f.range(0.66, 0.74));
    const active = Math.round(firstOp * f.range(0.62, 0.72));
    const data = [
      { value: 100, name: "Установка", itemStyle: { color: PALETTE[0] } },
      { value: reg, name: "Регистрация", itemStyle: { color: PALETTE[1] } },
      { value: kyc, name: "KYC", itemStyle: { color: PALETTE[2] } },
      { value: firstOp, name: "Первая операция", itemStyle: { color: PALETTE[3] } },
      { value: active, name: "Активный клиент", itemStyle: { color: PALETTE[5] } },
    ];
    return {
      tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${p.name}<br/><b>${p.value}%</b>` },
      series: [
        {
          type: "funnel", left: "6%", right: "6%", top: 10, bottom: 10, minSize: "24%", gap: 2,
          cursor: "pointer", selectedMode: "single",
          label: { show: true, position: "inside", color: "#fff", formatter: "{b}\n{c}%", fontSize: 11 },
          itemStyle: { borderColor: "#fff", borderWidth: 1 },
          emphasis: { focus: "self" },
          select: { itemStyle: { borderColor: INK, borderWidth: 2, shadowBlur: 18, shadowColor: hexA(PURPLE, 0.5) } },
          data,
        },
      ],
    };
  }, [seed]);

  // ---- 2. Dual-line + gradient area: DAU и MAU ----
  const dauM = useMemo(() => trendSeries("mob-dau-" + seed, 12, { start: kpi.dau * 0.86, growth: 0.014, noise: 0.05 }), [seed, kpi.dau]);
  const mauM = useMemo(() => trendSeries("mob-mau-" + seed, 12, { start: kpi.mau * 0.86, growth: 0.012, noise: 0.03 }), [seed, kpi.mau]);
  const dualOption = {
    grid: grid({ top: 34, right: 18 }),
    legend: { data: ["DAU", "MAU"], top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", valueFormatter: (v: number) => fmtShort(v) },
    xAxis: { ...catAxis(MONTHS), boundaryGap: false },
    yAxis: { ...moneyAxis },
    series: [
      {
        name: "DAU", type: "line", smooth: true, showSymbol: false, data: dauM,
        emphasis: { focus: "series" },
        lineStyle: { width: 2, color: PRIMARY }, itemStyle: { color: PRIMARY },
        areaStyle: { color: vGradient(hexA(PRIMARY, 0.35), hexA(PRIMARY, 0.02)) },
      },
      {
        name: "MAU", type: "line", smooth: true, showSymbol: false, data: mauM,
        emphasis: { focus: "series" },
        lineStyle: { width: 3, color: TEAL }, itemStyle: { color: TEAL },
      },
    ],
  };

  // ---- 3. Bar: средняя оценка по версиям ----
  const ratingsOption = useMemo(() => {
    const vr = rand("mob-ver-" + seed);
    const ratings = VERSIONS.map(() => +vr.range(4.1, 4.85).toFixed(2));
    return {
      grid: grid({ top: 24, right: 18 }),
      tooltip: { ...tooltipBox, trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v: number) => dec1(v) + " ★" },
      xAxis: catAxis(VERSIONS),
      yAxis: { type: "value", min: 0, max: 5, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11 } },
      series: [
        {
          type: "bar", barWidth: "52%",
          cursor: "pointer", selectedMode: "single",
          data: ratings.map((v, i) => ({ value: v, itemStyle: { color: PALETTE[i], borderRadius: [4, 4, 0, 0] } })),
          emphasis: EMPHASIS,
          select: SELECTED,
          label: { show: true, position: "top", formatter: (p: any) => dec1(p.value), fontSize: 10, color: MUTED },
        },
      ],
    };
  }, [seed]);

  // ---- 4. Pie: распределение по платформам ----
  const pieOption = useMemo(() => {
    const pr = rand("mob-plat-" + seed);
    const android = Math.round(pr.range(54, 60));
    const harmony = Math.round(pr.range(2, 4));
    const ios = 100 - android - harmony;
    const names = ["iOS", "Android", "HarmonyOS"];
    const vals = [ios, android, harmony];
    return {
      tooltip: { ...tooltipBox, trigger: "item", formatter: (p: any) => `${p.name}<br/><b>${p.percent}%</b>` },
      legend: { orient: "vertical", right: 0, top: "center", icon: "circle", textStyle: { fontSize: 11 }, itemGap: 10 },
      series: [
        {
          type: "pie", radius: "72%", center: ["38%", "50%"],
          cursor: "pointer", selectedMode: "single",
          itemStyle: { borderColor: "#fff", borderWidth: 2 },
          label: { show: true, formatter: (p: any) => `${p.name}\n${p.percent}%`, fontSize: 11, color: INK },
          emphasis: { focus: "self", scaleSize: 8 },
          select: { itemStyle: { borderColor: INK, borderWidth: 2, shadowBlur: 18, shadowColor: hexA(PURPLE, 0.5) } },
          data: names.map((name, i) => ({ name, value: vals[i], itemStyle: { color: PALETTE[i] } })),
        },
      ],
    };
  }, [seed]);

  return (
    <>
      <PageHeader
        title="Мобильное приложение"
        subtitle="Пользователи, вовлечённость и качество мобильного банка Alatau City Bank"
        right={
          <>
            <Segmented value={platform} onChange={setPlatform} options={[{ value: "all", label: "Все" }, { value: "ios", label: "iOS" }, { value: "android", label: "Android" }]} />
            <Select value={period} onChange={setPeriod} options={[{ value: "2024", label: "2024" }, { value: "2023", label: "2023" }]} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="MAU (месячная аудитория)" count={kpi.mau} format={fmtShort} delta={11.4} accent={PRIMARY} />
        <StatTile label="DAU (дневная аудитория)" count={kpi.dau} format={fmtShort} delta={8.7} accent={TEAL} />
        <StatTile label="Stickiness (DAU/MAU)" count={kpi.stickPct} format={(n) => fmtPct(n, 0)} delta={2.3} accent={POSITIVE} hint="Липкость аудитории" />
        <StatTile label="Оценка в сторах" value={dec1(kpi.rating) + " ★"} delta={0.4} accent={GOLD} hint="App Store и Google Play" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <ChartCard className="lg:col-span-2" title="Воронка онбординга" description="От установки до активного клиента, % от установок">
          <Chart option={funnelOption} height={340} />
        </ChartCard>
        <ChartCard className="lg:col-span-3" title="DAU и MAU" description="Помесячная динамика активной аудитории">
          <Chart option={dualOption} height={340} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Средняя оценка по версиям приложения" description="Рейтинг релизов v5.0–v5.6 по шкале 1–5">
          <Chart option={ratingsOption} height={300} />
        </ChartCard>
        <ChartCard title="Распределение по платформам" description="Доля активных устройств: iOS, Android, HarmonyOS">
          <Chart option={pieOption} height={300} />
        </ChartCard>
      </div>
    </>
  );
}
