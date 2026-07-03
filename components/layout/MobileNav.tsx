"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ALL_NAV } from "@/lib/nav";
import { cn } from "@/lib/cn";

export default function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="acb-scroll-x border-b border-bank-border bg-white lg:hidden">
      <div className="flex w-max gap-1 px-3 py-2">
        {ALL_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
              isActive(item.href)
                ? "bg-bank-primary-soft text-bank-primary"
                : "text-bank-muted hover:text-bank-ink"
            )}
          >
            {item.short ?? item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
