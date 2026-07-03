import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";

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
      <body className="font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <MobileNav />
            <main className="mx-auto w-full max-w-[1700px] flex-1 px-4 py-5 md:px-6 md:py-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
