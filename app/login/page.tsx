"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  // Demo gate — any credentials (even empty) pass straight through.
  const enter = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    document.cookie = "acb_auth=1; path=/; max-age=604800; samesite=lax";
    router.replace("/");
    router.refresh();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-4xl animate-fade-up overflow-hidden rounded-3xl border border-bank-border bg-white shadow-card-hover md:grid-cols-2">
        {/* ---- brand panel ---- */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-bank-primary via-bank-purple to-bank-red p-8 text-white md:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(24rem 18rem at 85% 10%, rgba(255,255,255,.28), transparent 60%), radial-gradient(20rem 16rem at 0% 100%, rgba(255,255,255,.18), transparent 60%)",
            }}
          />

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Alatau City Bank"
                className="h-full w-full object-cover"
              />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-bold">Alatau City Bank</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                Analytics Suite
              </p>
            </div>
          </div>

          <div className="relative">
            <h2 className="text-2xl font-bold leading-tight">
              Информационно-аналитический комплекс
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Финансы, портфели, риски, продукты и филиальная сеть — в реальном
              времени.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-white/90">
              {[
                "Интерактивная карта филиалов Казахстана",
                "9 разделов аналитики с живыми графиками",
                "Стратегический радар продуктов и сегментов",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 flex-shrink-0 text-white/90"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.79 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---- form panel ---- */}
        <div className="p-7 md:p-10">
          {/* mobile logo */}
          <div className="mb-7 flex items-center gap-2.5 md:hidden">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Alatau City Bank"
                className="h-full w-full object-cover"
              />
            </span>
            <p className="text-[15px] font-bold tracking-tight text-bank-ink">
              Alatau City Bank
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-bank-ink">
            Вход в систему
          </h1>
          <p className="mt-1 text-sm text-bank-muted">
            Войдите, чтобы открыть аналитическую панель банка.
          </p>

          <form onSubmit={enter} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-bank-ink">
                Логин
              </label>
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                >
                  <path
                    d="M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Введите логин"
                  autoComplete="username"
                  className="w-full rounded-xl border border-bank-border bg-white py-2.5 pl-10 pr-3.5 text-sm text-bank-ink outline-none transition-all placeholder:text-slate-400 focus:border-bank-primary focus:ring-4 focus:ring-bank-primary/15"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-bank-ink">
                Пароль
              </label>
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                >
                  <path
                    d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  type="password"
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-bank-border bg-white py-2.5 pl-10 pr-3.5 text-sm text-bank-ink outline-none transition-all placeholder:text-slate-400 focus:border-bank-primary focus:ring-4 focus:ring-bank-primary/15"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-bank-muted">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-bank-border accent-bank-primary"
              />
              Запомнить меня
            </label>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-bank-primary to-bank-purple px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-card-hover hover:brightness-105 active:scale-[.99] disabled:opacity-70"
            >
              {loading ? "Вход…" : "Войти"}
              {!loading && (
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L11.58 11H4a1 1 0 110-2h7.58L7.3 5.7a1 1 0 010-1.4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </form>

          <p className="mt-5 rounded-xl bg-bank-primary-soft/50 px-3 py-2 text-center text-[12px] leading-snug text-bank-muted">
            Демо-доступ: вход по любым данным — поля можно оставить пустыми.
          </p>
        </div>
      </div>
    </main>
  );
}
