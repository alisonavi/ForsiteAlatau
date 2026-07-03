"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Chart from "@/components/ui/Chart";
import { Segmented } from "@/components/ui/Controls";
import { fmtTenge } from "@/lib/format";
import { grid, tooltipBox, PRIMARY, TEAL, GOLD, hexA } from "@/lib/chart";
import { rand } from "@/lib/rng";

type Scope = "all" | "retail" | "sme" | "corp";

const SCOPE_PRODUCTS: Record<Scope, string[]> = {
  retail: ["Потреб. кредиты", "Ипотека", "Кредитные карты", "Депозиты физлиц", "Автокредиты", "Премиум-карты", "Digital-вклады"],
  sme: ["Кредиты МСБ", "Расчётный счёт", "Эквайринг", "Овердрафт МСБ", "Гарантии", "Зарплатные проекты"],
  corp: ["Корп. кредиты", "Торг. финансирование", "Казначейство", "Депозиты юрлиц", "Проектное финанс.", "Валютные операции"],
  all: [],
};
SCOPE_PRODUCTS.all = [...SCOPE_PRODUCTS.retail, ...SCOPE_PRODUCTS.sme, ...SCOPE_PRODUCTS.corp];

const MID_X = 10; // рост рынка, %
const MID_Y = 45; // относительная доля / маржинальность (индекс)

const QUADRANTS = [
  { key: "star", name: "Звёзды", color: "#16A34A", desc: "Высокий рост, высокая доля" },
  { key: "cow", name: "Дойные коровы", color: PRIMARY, desc: "Низкий рост, высокая доля" },
  { key: "question", name: "Вопросы", color: GOLD, desc: "Высокий рост, низкая доля" },
  { key: "dog", name: "Собаки", color: "#94A3B8", desc: "Низкий рост, низкая доля" },
];

function quadrantOf(x: number, y: number) {
  if (x >= MID_X && y >= MID_Y) return QUADRANTS[0];
  if (x < MID_X && y >= MID_Y) return QUADRANTS[1];
  if (x >= MID_X && y < MID_Y) return QUADRANTS[2];
  return QUADRANTS[3];
}

export default function RadarPage() {
  const [scope, setScope] = useState<Scope>("all");

  const products = useMemo(() => {
    return SCOPE_PRODUCTS[scope].map((name) => {
      const r = rand("radar:" + name);
      const x = +r.range(1, 19).toFixed(1); // рост, %
      const y = +r.range(15, 82).toFixed(0); // доля/маржа индекс
      const vol = Math.round(r.range(8e9, 140e9));
      const q = quadrantOf(x, y);
      return { name, x, y, vol, q };
    });
  }, [scope]);

  // ---------- BCG matrix ----------
  const matrixOption = {
    grid: grid({ left: 40, right: 24, top: 16, bottom: 44 }),
    tooltip: {
      ...tooltipBox,
      trigger: "item",
      formatter: (p: any) => {
        const [x, y, vol, name, qname] = p.data;
        return `<b>${name}</b><br/>Рост рынка: ${x}%<br/>Доля/маржа: ${y}<br/>Объём: ${fmtTenge(vol)}<br/><span style="opacity:.7">${qname}</span>`;
      },
    },
    xAxis: {
      type: "value",
      name: "Рост рынка, %  →",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { color: "#64748B", fontSize: 11, fontWeight: 600 },
      min: 0,
      max: 20,
      splitLine: { lineStyle: { color: "#F1F4F9" } },
      axisLabel: { color: "#94A3B8", fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      name: "Относительная доля  →",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { color: "#64748B", fontSize: 11, fontWeight: 600 },
      min: 0,
      max: 90,
      splitLine: { lineStyle: { color: "#F1F4F9" } },
      axisLabel: { color: "#94A3B8", fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "scatter",
        symbolSize: (d: number[]) => 14 + (d[2] / 140e9) * 46,
        data: products.map((p) => [p.x, p.y, p.vol, p.name, p.q.name]),
        itemStyle: {
          color: (p: any) => hexA(quadrantOf(p.data[0], p.data[1]).color, 0.72),
          borderColor: "#fff",
          borderWidth: 1.5,
        },
        label: {
          show: true,
          formatter: (p: any) => p.data[3],
          position: "top",
          fontSize: 10,
          color: "#334155",
        },
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: { color: "#CBD5E1", type: "dashed", width: 1.5 },
          label: { show: false },
          data: [{ xAxis: MID_X }, { yAxis: MID_Y }],
        },
        markArea: {
          silent: true,
          itemStyle: { opacity: 0.05 },
          data: [
            [{ name: "Звёзды", coord: [MID_X, MID_Y], itemStyle: { color: "#16A34A" }, label: { position: ["6%", "6%"], color: "#16A34A", fontWeight: 700, fontSize: 11 } }, { coord: [20, 90] }],
            [{ name: "Дойные коровы", coord: [0, MID_Y], itemStyle: { color: PRIMARY }, label: { position: ["6%", "6%"], color: PRIMARY, fontWeight: 700, fontSize: 11 } }, { coord: [MID_X, 90] }],
            [{ name: "Вопросы", coord: [MID_X, 0], itemStyle: { color: GOLD }, label: { position: ["6%", "80%"], color: "#B45309", fontWeight: 700, fontSize: 11 } }, { coord: [20, MID_Y] }],
            [{ name: "Собаки", coord: [0, 0], itemStyle: { color: "#94A3B8" }, label: { position: ["6%", "80%"], color: "#64748B", fontWeight: 700, fontSize: 11 } }, { coord: [MID_X, MID_Y] }],
          ],
        },
      },
    ],
  };

  // ---------- strategic radar (spider) ----------
  const radarOption = {
    tooltip: { ...tooltipBox, trigger: "item" },
    legend: { data: ["Alatau City Bank", "Рынок (средн.)"], bottom: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    radar: {
      indicator: [
        { name: "Цифровизация", max: 100 },
        { name: "Розница", max: 100 },
        { name: "МСБ", max: 100 },
        { name: "Корпоратив", max: 100 },
        { name: "Достаточность капитала", max: 100 },
        { name: "Ликвидность", max: 100 },
      ],
      radius: "66%",
      center: ["50%", "48%"],
      axisName: { color: "#64748B", fontSize: 11 },
      splitLine: { lineStyle: { color: "#E6EAF3" } },
      splitArea: { areaStyle: { color: ["#fff", "#F8FAFC"] } },
      axisLine: { lineStyle: { color: "#E6EAF3" } },
    },
    series: [
      {
        type: "radar",
        data: [
          { value: [88, 74, 66, 58, 82, 79], name: "Alatau City Bank", areaStyle: { color: hexA(PRIMARY, 0.22) }, lineStyle: { color: PRIMARY, width: 2 }, itemStyle: { color: PRIMARY } },
          { value: [70, 68, 71, 64, 75, 72], name: "Рынок (средн.)", areaStyle: { color: hexA(TEAL, 0.14) }, lineStyle: { color: TEAL, width: 2 }, itemStyle: { color: TEAL } },
        ],
      },
    ],
  };

  // ---------- assets forecast ----------
  const years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029"];
  const hist = [1.9e12, 2.1e12, 2.25e12, 2.55e12, 2.9e12, 3.35e12, 3.9e12, null, null, null, null, null];
  const forecast = [null, null, null, null, null, null, 3.9e12, 4.45e12, 5.0e12, 5.6e12, 6.25e12, 6.95e12];
  const forecastOption = {
    grid: grid({ top: 30, right: 20 }),
    legend: { data: ["Факт", "Прогноз"], right: 0, top: 0, icon: "roundRect", textStyle: { fontSize: 11 } },
    tooltip: { ...tooltipBox, trigger: "axis", valueFormatter: (v: number) => (v == null ? "—" : fmtTenge(v)) },
    xAxis: { type: "category", data: years, boundaryGap: false, axisTick: { show: false }, axisLine: { lineStyle: { color: "#EEF1F7" } }, axisLabel: { color: "#64748B", fontSize: 11 } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: "#EEF1F7" } }, axisLabel: { color: "#64748B", fontSize: 11, formatter: (v: number) => fmtTenge(v) } },
    series: [
      { name: "Факт", type: "line", smooth: true, showSymbol: false, connectNulls: false, lineStyle: { width: 3, color: PRIMARY }, areaStyle: { color: hexA(PRIMARY, 0.14) }, data: hist },
      { name: "Прогноз", type: "line", smooth: true, showSymbol: false, connectNulls: false, lineStyle: { width: 3, color: GOLD, type: "dashed" }, data: forecast },
    ],
  };

  return (
    <>
      <PageHeader
        title="Форсайт-радар"
        subtitle="Прогноз точек роста, продуктовая матрица и стратегическое позиционирование банка"
        right={
          <Segmented
            value={scope}
            onChange={(v) => setScope(v as Scope)}
            options={[
              { value: "all", label: "Все" },
              { value: "retail", label: "Розница" },
              { value: "sme", label: "МСБ" },
              { value: "corp", label: "Корпоратив" },
            ]}
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Продуктово-сегментная матрица (BCG)"
          description="По горизонтали — рост рынка, по вертикали — относительная доля; размер круга — объём портфеля"
        >
          <Chart option={matrixOption} height={420} />
        </ChartCard>

        <div className="flex flex-col gap-4">
          <ChartCard title="Стратегический профиль" description="Alatau City Bank против среднерыночных значений">
            <Chart option={radarOption} height={300} />
          </ChartCard>
          <div className="acb-card p-4">
            <p className="text-[13px] font-semibold text-bank-ink">Легенда матрицы</p>
            <ul className="mt-2 space-y-2">
              {QUADRANTS.map((q) => (
                <li key={q.key} className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: q.color }} />
                  <div>
                    <p className="text-xs font-semibold text-bank-ink">{q.name}</p>
                    <p className="text-[11px] text-bank-muted">{q.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Динамика и прогноз активов" description="Факт 2018–2024 и прогноз до 2029 года">
          <Chart option={forecastOption} height={300} />
        </ChartCard>
        <ChartCard title="Рекомендации" description="Приоритеты на основе позиционирования">
          <ul className="space-y-3 pt-1">
            {[
              { t: "Масштабировать «Звёзды»", d: "Digital-вклады и премиум-карты — наращивать долю и удержание.", c: "#16A34A" },
              { t: "Защищать «Дойных коров»", d: "Ипотека и депозиты физлиц — оптимизировать маржу.", c: PRIMARY },
              { t: "Тестировать «Вопросы»", d: "Эквайринг и торговое финансирование — точечные инвестиции.", c: GOLD },
              { t: "Сокращать «Собак»", d: "Низкомаржинальные продукты — пересмотр или закрытие.", c: "#94A3B8" },
            ].map((r) => (
              <li key={r.t} className="rounded-xl border border-bank-border p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.c }} />
                  <p className="text-[13px] font-semibold text-bank-ink">{r.t}</p>
                </div>
                <p className="mt-1 text-xs text-bank-muted">{r.d}</p>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </>
  );
}
