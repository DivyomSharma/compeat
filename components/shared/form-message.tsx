import { cn } from "@/lib/utils";

export function FormMessage({
  message,
  success = false,
  className,
}: {
  message?: string;
  success?: boolean;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-sm border-[3px] px-4 py-3 text-sm",
        success
          ? "border-border bg-accent text-accent-foreground"
          : "border-border bg-[var(--surface-yellow)] text-foreground dark:text-black",
        className
      )}
    >
      {message}
    </div>
  );
}
