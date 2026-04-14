import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "neo-card flex flex-col items-start gap-4 p-6 md:p-8",
        className
      )}
    >
      <div className="inline-flex size-12 items-center justify-center rounded-sm border-[3px] border-border bg-secondary text-secondary-foreground">
        <Icon className="size-5" />
      </div>
      <div className="space-y-2">
        <h3 className="font-heading text-2xl font-black uppercase tracking-tight">
          {title}
        </h3>
        <p className="max-w-xl text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
