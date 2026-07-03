"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

export default function Header() {
  const router = useRouter();

  const logout = () => {
    document.cookie = "acb_auth=; path=/; max-age=0; samesite=lax";
    router.replace("/login");
    router.refresh();
  };

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
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg border border-bank-border bg-white px-3.5 py-2 text-[13px] font-medium text-bank-ink shadow-sm transition-all hover:border-bank-red/40 hover:text-bank-red active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-4 w-4"
          >
            <path
              d="M14 17l5-5-5-5M19 12H7M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:inline">Выйти</span>
        </button>
      </div>
    </header>
  );
}
