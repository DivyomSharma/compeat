"use client";

import Link from "next/link";
import { CalendarDays, MapPin, School2, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventFilterStore } from "@/features/events/stores/use-event-filter-store";
import type { CompetitionEvent } from "@/lib/types";
import { formatDateOnly } from "@/lib/utils";

const categoryOptions = [
  "all",
  "Hackathon",
  "Debate",
  "Workshop",
  "Cultural",
  "Sports",
];

export function EventExplorer({
  schoolEvents,
  networkEvents,
}: {
  schoolEvents: CompetitionEvent[];
  networkEvents: CompetitionEvent[];
}) {
  const { category, city, scope, setCategory, setCity, setScope } =
    useEventFilterStore();

  const visibleEvents = useMemo(() => {
    const source =
      scope === "my-school"
        ? schoolEvents
        : scope === "network"
          ? networkEvents
          : [...schoolEvents, ...networkEvents];

    return source.filter((event) => {
      const categoryMatch = category === "all" ? true : event.category === category;
      const cityMatch = city
        ? event.city.toLowerCase().includes(city.toLowerCase())
        : true;

      return categoryMatch && cityMatch;
    });
  }, [category, city, networkEvents, schoolEvents, scope]);

  return (
    <div className="space-y-6">
      <div className="neo-card p-5">
        <div className="grid gap-4 md:grid-cols-[180px_220px_1fr]">
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Scope
            </label>
            <Select value={scope} onValueChange={(value) => setScope(value as typeof scope)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                <SelectItem value="my-school">My school</SelectItem>
                <SelectItem value="network">Network feed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "all" ? "All categories" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              City
            </label>
            <Input
              placeholder="Search by city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleEvents.length ? (
          visibleEvents.map((event) => (
            <article key={event.id} className="neo-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge>{event.category}</Badge>
                    <Badge variant="outline">{event.visibility}</Badge>
                    {event.allows_cross_school ? (
                      <Badge variant="secondary">
                        <Sparkles className="size-3" />
                        Open network
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="font-heading text-2xl font-black uppercase tracking-tight">
                    {event.title}
                  </h3>
                </div>
                <div className="rounded-sm border-[3px] border-border bg-[var(--surface-yellow)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] dark:text-black">
                  {formatDateOnly(event.starts_at)}
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">{event.description}</p>

              <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <School2 className="size-4" />
                  <span>{event.schools?.name || "Campus event"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>
                    {event.venue}, {event.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  <span>Deadline {formatDateOnly(event.registration_deadline)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span>
                    {event.capacity ? `${event.capacity} seats` : "Open capacity"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button asChild className="w-full md:w-auto">
                  <Link href={`/events/${event.id}`}>View event</Link>
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div className="neo-card col-span-2 flex flex-col items-center gap-4 p-10 text-center">
            <CalendarDays className="size-10 text-muted-foreground" />
            <div>
              <h3 className="font-heading text-2xl font-black uppercase">No events found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different filter, category, or city to explore more events.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

