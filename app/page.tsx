import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Network,
  Trophy,
  Users2,
} from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicEventFeed } from "@/lib/supabase/queries";
import { formatDateOnly } from "@/lib/utils";

export default async function HomePage() {
  const featuredEvents = await getPublicEventFeed();

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b-[3px] border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] 2xl:max-w-none items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <BrandMark />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild>
              <Link href="/auth/sign-in">Launch Compeat</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] 2xl:max-w-none flex-1 space-y-10 px-4 py-8 sm:px-8 pb-16">
        {/* ── Hero ── */}
        <section className="neo-card overflow-hidden">
          <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.2fr_1fr] xl:p-12">
            {/* Left */}
            <div className="flex flex-col justify-center">
              <div className="neo-kicker">Competitions. Events. Campus network.</div>
              <h1 className="mt-5 font-heading text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl xl:text-6xl">
                The campus platform built for high-frequency event culture.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Compeat by PlotArmour Studio helps institutions onboard as
                campuses, clubs run daily workflows, and students discover events
                across the network without the drag of a generic ERP.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/sign-in">
                    Sign in free
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/events">Explore event flow</Link>
                </Button>
              </div>
            </div>

            {/* Right */}
            <div className="grid gap-4 content-start">
              <div className="neo-panel p-5">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  What ships in MVP
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    { label: "Institution onboarding", icon: Building2 },
                    { label: "Club operations", icon: Users2 },
                    { label: "Event creation", icon: CalendarDays },
                    { label: "Inter-college network", icon: Network },
                  ].map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-sm border-[3px] border-border bg-card px-4 py-3"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="font-semibold">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              body: "Enforce workspace isolation while still exposing a public event network.",
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

        {/* ── Public event feed ── */}
        {featuredEvents.length > 0 && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
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
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredEvents.slice(0, 4).map((event) => (
                <article key={event.id} className="neo-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge>{event.category}</Badge>
                        {event.allows_cross_school ? (
                          <Badge variant="secondary">Cross-school open</Badge>
                        ) : null}
                      </div>
                      <h3 className="font-heading text-xl font-black uppercase leading-tight">
                        {event.title}
                      </h3>
                    </div>
                    <div className="shrink-0 rounded-sm border-[3px] border-border bg-[var(--surface-yellow)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] dark:text-black">
                      {formatDateOnly(event.starts_at)}
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  <p className="mt-5 text-sm font-semibold">
                    {event.schools?.name} · {event.venue}, {event.city}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t-[3px] border-border py-6">
        <div className="mx-auto max-w-[1600px] 2xl:max-w-none px-4 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Compeat · Powered by PlotArmour Studio
          </p>
        </div>
      </footer>
    </div>
  );
}
