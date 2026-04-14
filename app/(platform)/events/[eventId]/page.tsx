import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventRegistrationForm } from "@/features/events/components/event-registration-form";
import { requireActiveSchool } from "@/lib/auth";
import { getEventDetails } from "@/lib/supabase/queries";
import { formatDateTime } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const viewer = await requireActiveSchool();
  const { event, registration, relatedEvents } = await getEventDetails(
    eventId,
    viewer.authUserId
  );

  if (!event) {
    notFound();
  }

  const canManage =
    viewer.roles.includes("admin") || event.organizer_id === viewer.authUserId;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="neo-card p-6">
          <div className="flex flex-wrap gap-2">
            <Badge>{event.category}</Badge>
            <Badge variant="outline">{event.visibility}</Badge>
            {event.allows_cross_school ? (
              <Badge variant="secondary">Cross-school enabled</Badge>
            ) : null}
          </div>
          <h1 className="mt-5 font-heading text-4xl font-black uppercase">
            {event.title}
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            {event.description}
          </p>

          <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              <span>{formatDateTime(event.starts_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <span>
                {event.venue}, {event.city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <span>
                {event.capacity ? `${event.capacity} participant slots` : "Open capacity"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              <span>{event.schools?.name}</span>
            </div>
          </div>

          {canManage ? (
            <div className="mt-6">
              <Button asChild variant="secondary">
                <Link href={`/events/${event.id}/manage`}>Open event dashboard</Link>
              </Button>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <section className="neo-card p-6">
            <h2 className="font-heading text-2xl font-black uppercase">
              Register for this event
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Submit your registration and track approval status from your dashboard.
            </p>
            <div className="mt-5">
              <EventRegistrationForm eventId={event.id} registration={registration} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-black uppercase">
              More to explore
            </h2>
            {relatedEvents.map((relatedEvent) => (
              <article key={relatedEvent.id} className="neo-card p-5">
                <Badge>{relatedEvent.category}</Badge>
                <h3 className="mt-4 font-heading text-2xl font-black uppercase">
                  {relatedEvent.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatDateTime(relatedEvent.starts_at)}
                </p>
                <Button asChild className="mt-4">
                  <Link href={`/events/${relatedEvent.id}`}>View event</Link>
                </Button>
              </article>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
