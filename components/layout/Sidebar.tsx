"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import NavIcon from "./NavIcon";
import { ANALYTICS_NAV, PRIMARY_NAV } from "@/lib/nav";
import { cn } from "@/lib/cn";

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
        active
          ? "bg-bank-primary-soft text-bank-primary"
          : "text-bank-muted hover:bg-slate-50 hover:text-bank-ink"
      )}
    >
      <span
        className={cn(
          active ? "text-bank-primary" : "text-slate-400 group-hover:text-bank-ink"
        )}
      >
        <NavIcon name={icon} />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 flex-col border-r border-bank-border bg-white lg:flex">
      <div className="px-4 py-5">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}

        <p className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Аналитика
        </p>
        {ANALYTICS_NAV.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.short ?? item.label}
            icon={item.icon}
            active={isActive(item.href)}
          />
        ))}
      </nav>

      <div className="border-t border-bank-border p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold text-bank-ink">Демо-режим</p>
          <p className="mt-0.5 text-[11px] leading-snug text-bank-muted">
            Данные смоделированы на стороне клиента для демонстрации.
          </p>
        </div>
      </div>
    </aside>
  );
}
