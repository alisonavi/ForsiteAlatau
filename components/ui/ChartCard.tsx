import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
};

export default function ChartCard({
  title,
  description,
  right,
  children,
  className,
  footer,
}: Props) {
  return (
    <section
      className={cn(
        "acb-card flex flex-col p-4 md:p-5 animate-fade-up transition-shadow hover:shadow-card-hover",
        className
      )}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold leading-tight text-bank-ink md:text-sm">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-xs leading-snug text-bank-muted">{description}</p>
          ) : null}
        </div>
        {right ? <div className="flex-shrink-0">{right}</div> : null}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </section>
  );
}
