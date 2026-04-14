import { type LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "bg-primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="neo-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {label}
        </span>
        <span
          className={`inline-flex size-10 items-center justify-center rounded-sm border-[3px] border-border ${accent}`}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div className="font-heading text-4xl font-black tracking-tight">
        {value}
      </div>
    </div>
  );
}
