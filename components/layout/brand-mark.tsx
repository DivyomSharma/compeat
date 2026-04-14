import Image from "next/image";
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
      <Image 
        src="/logo.svg" 
        alt="Compeat Logo" 
        width={36} 
        height={36} 
        className="shrink-0"
      />
      {!compact ? (
        <span className="hidden flex-col leading-none sm:flex">
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
