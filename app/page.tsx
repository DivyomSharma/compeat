import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Network,
  ShieldCheck,
  Trophy,
  Users2,
} from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/config";
import { getPublicEventFeed } from "@/lib/supabase/queries";
import { formatDateOnly } from "@/lib/utils";

export default async function HomePage() {
  const featuredEvents = await getPublicEventFeed();

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-6">
        <BrandMark />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild>
            <Link href="/auth/sign-in">Launch Compeat</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-12 md:px-6">
        <section className="neo-card overflow-hidden">
          <div className="grid gap-8 p-6 md:grid-cols-[1.4fr_0.8fr] md:p-10">
            <div>
              <div className="neo-kicker">Competitions. Events. Campus network.</div>
              <h1 className="neo-heading mt-5 max-w-4xl">
                The campus platform built for high-frequency event culture.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
                Compeat by PlotArmour Studio helps institutions onboard as
                tenants, clubs run daily workflows, and students discover events
                across campuses without the drag of a generic ERP.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/sign-in">
                    Start with OTP
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/events">Explore event flow</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="neo-panel p-5">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  What ships in MVP
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    { label: "Tenant onboarding", icon: Building2 },
                    { label: "Club operations", icon: Users2 },
                    { label: "Event creation", icon: CalendarDays },
                    { label: "Inter-college network", icon: Network },
                  ].map(({ label, icon: Icon }) => {
                    return (
                      <div
                        key={label}
                        className="flex items-center gap-3 rounded-sm border-[3px] border-border bg-card px-4 py-3"
                      >
                        <Icon className="size-4" />
                        <span className="font-semibold">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {!isSupabaseConfigured() ? (
                <div className="neo-panel bg-[var(--surface-yellow)] p-5 dark:text-black">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em]">
                    <ShieldCheck className="size-4" />
                    Setup note
                  </div>
                  <p className="mt-3 text-sm">
                    Add Supabase environment variables from `.env.example` to
                    activate auth, data, storage, and RLS-backed flows.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Student velocity",
              body: "Discover events, register fast, and keep certificates in one place.",
              icon: Trophy,
            },
            {
              title: "Club control",
              body: "Manage members, assign roles, and turn club momentum into actual turnout.",
              icon: Users2,
            },
            {
              title: "Institution scale",
              body: "Enforce tenant isolation while still exposing a public event network.",
              icon: Building2,
            },
          ].map(({ title, body, icon: Icon }) => (
            <article key={title} className="neo-card p-5">
              <div className="inline-flex size-11 items-center justify-center rounded-sm border-[3px] border-border bg-secondary text-secondary-foreground">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-5 font-heading text-2xl font-black uppercase">
                {title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">{body}</p>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Inter-college feed
              </p>
              <h2 className="font-heading text-3xl font-black uppercase">
                Live-ready public events
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/events">Browse all events</Link>
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {featuredEvents.slice(0, 4).map((event) => (
              <article key={event.id} className="neo-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-3 flex gap-2">
                      <Badge>{event.category}</Badge>
                      {event.allows_cross_school ? (
                        <Badge variant="secondary">Cross-school open</Badge>
                      ) : null}
                    </div>
                    <h3 className="font-heading text-2xl font-black uppercase">
                      {event.title}
                    </h3>
                  </div>
                  <div className="rounded-sm border-[3px] border-border bg-[var(--surface-yellow)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] dark:text-black">
                    {formatDateOnly(event.starts_at)}
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {event.description}
                </p>
                <p className="mt-5 text-sm font-semibold">
                  {event.schools?.name} · {event.venue}, {event.city}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
