import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, Users } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { RegistrationReviewTable } from "@/features/events/components/registration-review-table";
import { requireActiveSchool } from "@/lib/auth";
import { getEventManagementDetails } from "@/lib/supabase/queries";

export default async function EventManagePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const viewer = await requireActiveSchool();
  const { event, registrations, stats } = await getEventManagementDetails(eventId);

  if (!event) {
    notFound();
  }

  if (
    !viewer.roles.includes("admin") &&
    event.organizer_id !== viewer.authUserId
  ) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="neo-card p-6">
        <div className="neo-kicker">Event dashboard</div>
        <h1 className="mt-4 font-heading text-4xl font-black uppercase">
          {event.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Review registrations, approve participants, and generate certificates
          once the event is complete.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Total" value={stats.total} />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={stats.approved}
          accent="bg-accent text-accent-foreground"
        />
        <StatCard
          icon={Clock3}
          label="Pending"
          value={stats.pending}
          accent="bg-secondary text-secondary-foreground"
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-black uppercase">
          Registrations
        </h2>
        <RegistrationReviewTable eventId={event.id} registrations={registrations} />
      </section>
    </div>
  );
}
