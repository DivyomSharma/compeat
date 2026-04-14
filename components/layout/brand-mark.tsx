import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-3 rounded-md border-[3px] border-border bg-card px-3 py-2 neo-shadow-sm",
        className
      )}
    >
      <span className="inline-flex size-10 items-center justify-center rounded-sm border-[3px] border-border bg-primary font-heading text-lg font-black uppercase text-primary-foreground">
        C
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-lg font-black uppercase tracking-tight">
            Compeat
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            PlotArmour Studio
          </span>
        </span>
      ) : null}
    </Link>
  );
}
