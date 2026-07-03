"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { cn } from "@/lib/cn";

const LANGS = ["қаз", "рус", "eng"];

export default function Header() {
  const [lang, setLang] = useState("рус");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-bank-border bg-white/85 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="lg:hidden">
          <Logo withText={false} />
        </Link>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-bank-ink">
            Информационно-аналитический комплекс
          </p>
          <p className="text-[11px] text-bank-muted">
            Интерактивная аналитика · Alatau City Bank
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <span className="hidden items-center gap-1.5 rounded-full bg-bank-primary-soft px-3 py-1 text-[11px] font-medium text-bank-primary sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-bank-green" />
          Данные обновлены · 2024
        </span>

        <div className="flex items-center gap-1 text-[13px]">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "rounded px-1.5 py-0.5 transition-colors",
                lang === l
                  ? "font-semibold text-bank-ink"
                  : "text-slate-400 hover:text-bank-ink"
              )}
            >
              {l}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-bank-primary to-bank-purple px-3.5 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:shadow-card-hover hover:brightness-105 active:scale-95">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-4 w-4"
          >
            <path
              d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:inline">Войти</span>
        </button>
      </div>
    </header>
  );
}
