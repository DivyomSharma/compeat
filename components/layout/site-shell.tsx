"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  Menu,
  Network,
  ShieldCheck,
  Users2,
} from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAppShellStore } from "@/hooks/use-app-shell-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clubs", label: "Clubs", icon: Users2 },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/events?scope=network", label: "Network", icon: Network },
];

type SiteShellProps = {
  userName: string;
  schoolName: string;
  roleLabel: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/events?scope=network"
            ? pathname === "/events"
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-sm border-[3px] border-border px-4 py-3 font-heading text-sm font-black uppercase tracking-tight transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5",
              isActive
                ? "bg-primary text-primary-foreground shadow-[5px_5px_0_0_var(--border)]"
                : "bg-card text-card-foreground shadow-[5px_5px_0_0_var(--border)]"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteShell({
  userName,
  schoolName,
  roleLabel,
  actions,
  children,
}: SiteShellProps) {
  const { mobileNavOpen, setMobileNavOpen } = useAppShellStore();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b-[3px] border-border bg-background/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" aria-label="Open navigation">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[86%] max-w-xs border-r-[3px] border-border bg-card p-0 shadow-[8px_0_0_0_var(--border)]"
                >
                  <SheetHeader className="border-b-[3px] border-border bg-muted p-5 text-left">
                    <SheetTitle className="font-heading text-2xl font-black uppercase">
                      Navigate
                    </SheetTitle>
                    <SheetDescription>
                      Jump between student, club, and event workflows.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 p-5">
                    <NavLinks onNavigate={() => setMobileNavOpen(false)} />
                    <div className="neo-panel p-4">
                      <div className="font-heading text-lg font-black uppercase">
                        {userName}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {schoolName}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <BrandMark />
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <div className="neo-panel px-4 py-2">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                <ShieldCheck className="size-3.5" />
                {roleLabel}
              </div>
            </div>
            <ThemeToggle />
            {actions}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[280px_1fr] md:px-6">
        <aside className="hidden space-y-4 md:block">
          <div className="neo-card p-5">
            <div className="inline-flex items-center gap-2 rounded-sm border-[3px] border-border bg-accent px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-foreground">
              Campus shell
            </div>
            <div className="mt-4">
              <div className="font-heading text-2xl font-black uppercase tracking-tight">
                {userName}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{schoolName}</div>
            </div>
          </div>
          <NavLinks />
        </aside>

        <main className="space-y-6">
          <div className="flex items-center justify-between gap-3 md:hidden">
            <div className="neo-panel flex-1 px-4 py-3">
              <div className="font-heading text-lg font-black uppercase">
                {schoolName}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {roleLabel}
              </div>
            </div>
            <ThemeToggle />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
