import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alatau City Bank — Аналитический комплекс",
  description:
    "Информационно-аналитический комплекс Alatau City Bank: финансовые показатели, портфели, риски, продукты, KPI и филиальная сеть.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="font-sans">{children}</body>
    </html>
  );
}
