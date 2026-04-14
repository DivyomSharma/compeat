import Link from "next/link";
import { FolderKanban, Mail } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateClubDialog } from "@/features/clubs/components/create-club-dialog";
import { requireActiveSchool } from "@/lib/auth";
import { getClubsForSchool } from "@/lib/supabase/queries";

export default async function ClubsPage() {
  const viewer = await requireActiveSchool();
  const clubs = await getClubsForSchool(viewer.activeSchoolId!, {
    showAll: viewer.roles.includes("admin"),
    userId: viewer.authUserId,
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="neo-kicker">Club system</div>
          <h1 className="mt-4 font-heading text-4xl font-black uppercase">
            Campus clubs with member roles and event ownership.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Clubs are where students organize, assign responsibilities, and turn
            ideas into actual campus turnout.
          </p>
        </div>
        {viewer.roles.includes("admin") ? <CreateClubDialog /> : null}
      </section>

      {clubs.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clubs.map((club) => (
            <article key={club.id} className="neo-card p-5">
              <div className="flex items-start justify-between gap-3">
                <Badge>{club.category}</Badge>
                <span className="rounded-sm border-[3px] border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  Club
                </span>
              </div>
              <h2 className="mt-4 font-heading text-2xl font-black uppercase">
                {club.name}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {club.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm">
                <Mail className="size-4" />
                <span>{club.contact_email}</span>
              </div>
              <Button asChild className="mt-5">
                <Link href={`/clubs/${club.id}`}>Open club dashboard</Link>
              </Button>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No clubs available yet"
          description={
            viewer.roles.includes("admin")
              ? "Create the first club for this campus and start assigning roles."
              : "You haven’t joined any clubs yet. Ask a campus admin or club president to add you."
          }
          action={
            viewer.roles.includes("admin") ? <CreateClubDialog /> : undefined
          }
        />
      )}
    </div>
  );
}
