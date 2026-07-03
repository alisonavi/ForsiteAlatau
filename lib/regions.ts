// Kazakhstan region metadata. Index matches the SVG paths in
// components/map/KazakhstanMapSVG.tsx (index 10 / old ЮКО is not rendered).
import { mulberry32, seedFrom } from "./rng";

export type Region = {
  index: number;
  name: string; // full RU
  short: string;
  city?: boolean;
};

export const REGIONS: Region[] = [
  { index: 0, name: "Акмолинская область", short: "Акмолинская" },
  { index: 1, name: "Актюбинская область", short: "Актюбинская" },
  { index: 2, name: "Алматинская область", short: "Алматинская" },
  { index: 3, name: "Атырауская область", short: "Атырауская" },
  { index: 4, name: "Западно-Казахстанская область", short: "ЗКО" },
  { index: 5, name: "Жамбылская область", short: "Жамбылская" },
  { index: 6, name: "Карагандинская область", short: "Карагандинская" },
  { index: 7, name: "Костанайская область", short: "Костанайская" },
  { index: 8, name: "Кызылординская область", short: "Кызылординская" },
  { index: 9, name: "Мангистауская область", short: "Мангистауская" },
  { index: 11, name: "Павлодарская область", short: "Павлодарская" },
  { index: 12, name: "Северо-Казахстанская область", short: "СКО" },
  { index: 13, name: "Восточно-Казахстанская область", short: "ВКО" },
  { index: 14, name: "г. Астана", short: "Астана", city: true },
  { index: 15, name: "г. Алматы", short: "Алматы", city: true },
  { index: 16, name: "Туркестанская область", short: "Туркестанская" },
  { index: 17, name: "г. Шымкент", short: "Шымкент", city: true },
  { index: 18, name: "Абай область", short: "Абай" },
  { index: 19, name: "Жетісу область", short: "Жетісу" },
  { index: 20, name: "Ұлытау область", short: "Ұлытау" },
];

export type RegionMetric = {
  region: Region;
  branches: number; // number of bank branches
  atms: number;
  deposits: number; // ₸
  loans: number; // ₸
  taxes: number; // ₸ paid
  clients: number;
  tier: "top" | "middle" | "bottom";
};

// Head-office hubs get an outsized share — makes the choropleth realistic.
const HUB_BONUS: Record<number, number> = {
  15: 3.4, // Алматы
  14: 3.0, // Астана
  17: 1.9, // Шымкент
  6: 1.5, // Караганда
  2: 1.4, // Алматинская
};

export function regionMetrics(): RegionMetric[] {
  const rows = REGIONS.map((region) => {
    const r = mulberry32(seedFrom("region:" + region.index));
    const bonus = HUB_BONUS[region.index] ?? 1;
    const base = 0.5 + r();
    const branches = Math.round((6 + r() * 22) * bonus);
    const deposits = Math.round((40e9 + r() * 120e9) * bonus * base);
    const loans = Math.round(deposits * (0.6 + r() * 0.5));
    return {
      region,
      branches,
      atms: Math.round(branches * (3 + r() * 4)),
      deposits,
      loans,
      taxes: Math.round((0.9e9 + r() * 4e9) * bonus),
      clients: Math.round((25000 + r() * 90000) * bonus),
      tier: "middle" as RegionMetric["tier"],
    };
  });
  // classify tiers by deposits for map coloring
  const sorted = [...rows].sort((a, b) => b.deposits - a.deposits);
  sorted.forEach((row, i) => {
    row.tier = i < 5 ? "top" : i < 12 ? "middle" : "bottom";
  });
  return rows;
}

export const TIER_COLOR: Record<RegionMetric["tier"], string> = {
  top: "#1D4ED8",
  middle: "#60A5FA",
  bottom: "#C7DBFF",
};
export const TIER_LABEL: Record<RegionMetric["tier"], string> = {
  top: "Высокий объём",
  middle: "Средний объём",
  bottom: "Развивающийся",
};
