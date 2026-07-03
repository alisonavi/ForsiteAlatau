import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alatau City Bank — Аналитический комплекс",
  description:
    "Информационно-аналитический комплекс Alatau City Bank: финансовые показатели, портфели, риски, продукты, KPI и филиальная сеть.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
