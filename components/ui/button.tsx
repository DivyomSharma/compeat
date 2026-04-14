import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border-[3px] border-border text-sm font-semibold uppercase whitespace-nowrap transition-transform outline-none select-none focus-visible:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ring/20 active:translate-x-1 active:translate-y-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[5px_5px_0_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5",
        outline:
          "bg-card text-card-foreground shadow-[5px_5px_0_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[5px_5px_0_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5",
        ghost:
          "bg-muted text-foreground shadow-[5px_5px_0_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-white shadow-[5px_5px_0_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5",
        link:
          "border-none bg-transparent p-0 text-primary shadow-none underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-8 gap-1 px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-5 text-sm",
        icon: "size-11",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
