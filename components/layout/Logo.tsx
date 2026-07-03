import { cn } from "@/lib/cn";

export default function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 transition-transform duration-300 hover:scale-105">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Alatau City Bank"
          width={36}
          height={36}
          className="h-full w-full object-cover"
        />
      </span>
      {withText ? (
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-bank-ink">
            Alatau City Bank
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-bank-muted">
            Analytics Suite
          </p>
        </div>
      ) : null}
    </div>
  );
}
