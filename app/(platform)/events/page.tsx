import { Sparkles } from "lucide-react";

import { CreateEventDialog } from "@/features/events/components/create-event-dialog";
import { EventExplorer } from "@/features/events/components/event-explorer";
import { requireActiveSchool } from "@/lib/auth";
import {
  getClubsForSchool,
  getEventsForExplorer,
  getPublicEventFeed,
} from "@/lib/supabase/queries";

export default async function EventsPage() {
  const viewer = await requireActiveSchool();
  const [schoolEvents, networkEvents, clubs] = await Promise.all([
    getEventsForExplorer({ schoolId: viewer.activeSchoolId! }),
    getPublicEventFeed(),
    getClubsForSchool(viewer.activeSchoolId!, {
      showAll: viewer.roles.includes("admin"),
      userId: viewer.authUserId,
    }),
  ]);

  const canCreate = viewer.roles.includes("admin") || Boolean(clubs.length);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="neo-kicker">Events + network</div>
          <h1 className="mt-4 font-heading text-4xl font-black uppercase">
            Discover campus events and cross-college opportunities.
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Your institution gets its own event stream, while public competitions
            can still attract students from other campuses.
          </p>
        </div>
        {canCreate ? <CreateEventDialog clubs={clubs} /> : null}
      </section>

      <section className="neo-panel p-5">
        <div className="flex items-center gap-3">
          <Sparkles className="size-5" />
          <p className="text-sm">
            Public, cross-school events stay visible in the same explorer so
            students never miss what&apos;s happening beyond their own campus.
          </p>
        </div>
      </section>

      <EventExplorer schoolEvents={schoolEvents} networkEvents={networkEvents} />
    </div>
  );
}
