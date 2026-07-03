export type NavItem = {
  label: string;
  href: string;
  icon: string; // inline svg key (see components/layout/NavIcon.tsx)
  short?: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { label: "Главная", href: "/", icon: "home" },
  { label: "Радар", href: "/radar", icon: "radar" },
];

export const ANALYTICS_NAV: NavItem[] = [
  { label: "Финансовые показатели", href: "/analytics/financial", icon: "chart", short: "Финансы" },
  { label: "Банковские портфели", href: "/analytics/portfolios", icon: "layers", short: "Портфели" },
  { label: "Риски", href: "/analytics/risks", icon: "shield", short: "Риски" },
  { label: "Мобильное приложение", href: "/analytics/mobile", icon: "phone", short: "Моб. приложение" },
  { label: "Продукты", href: "/analytics/products", icon: "cube", short: "Продукты" },
  { label: "Маркетинг", href: "/analytics/marketing", icon: "megaphone", short: "Маркетинг" },
  { label: "Ключевые показатели (KPI)", href: "/analytics/kpi", icon: "target", short: "KPI" },
  { label: "ФОТ и штат", href: "/analytics/payroll", icon: "users", short: "ФОТ / штат" },
  { label: "Налоги по филиалам", href: "/analytics/taxes", icon: "map", short: "Налоги" },
];

export const ALL_NAV = [...PRIMARY_NAV, ...ANALYTICS_NAV];
