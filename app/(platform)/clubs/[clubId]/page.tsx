import { notFound } from "next/navigation";
import { CalendarDays, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddClubMemberForm } from "@/features/clubs/components/add-club-member-form";
import { removeClubMemberAction } from "@/features/clubs/actions";
import { requireActiveSchool } from "@/lib/auth";
import { getClubDetails } from "@/lib/supabase/queries";
import { formatDateTime, formatRoleLabel } from "@/lib/utils";

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const viewer = await requireActiveSchool();
  const { club, members, events } = await getClubDetails(clubId);

  if (!club) {
    notFound();
  }

  const canManage =
    viewer.roles.includes("admin") ||
    members.some(
      (member) =>
        member.user_id === viewer.authUserId &&
        (member.role === "club_president" || member.role === "vice_president")
    );

  return (
    <div className="space-y-6">
      <section className="neo-card p-6">
        <Badge>{club.category}</Badge>
        <h1 className="mt-4 font-heading text-4xl font-black uppercase">
          {club.name}
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">{club.description}</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="size-5" />
            <h2 className="font-heading text-2xl font-black uppercase">
              Members
            </h2>
          </div>
          <div className="space-y-3">
            {members.map((member) => (
              <article key={member.id} className="neo-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {member.users?.display_name ||
                        member.users?.full_name ||
                        member.users?.email}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {member.users?.email}
                    </div>
                  </div>
                  <Badge variant="outline">{formatRoleLabel(member.role)}</Badge>
                </div>
                {canManage && member.user_id !== viewer.authUserId ? (
                  <form
                    action={removeClubMemberAction.bind(null, club.id, member.user_id)}
                    className="mt-4"
                  >
                    <Button type="submit" variant="outline" size="sm">
                      <Trash2 />
                      Remove member
                    </Button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {canManage ? (
            <section className="neo-card p-5">
              <h2 className="font-heading text-2xl font-black uppercase">
                Add member
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Invite members by their campus email and assign a scoped club role.
              </p>
              <div className="mt-5">
                <AddClubMemberForm clubId={club.id} />
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-5" />
              <h2 className="font-heading text-2xl font-black uppercase">
                Club events
              </h2>
            </div>
            {events.length ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <article key={event.id} className="neo-card p-5">
                    <Badge>{event.category}</Badge>
                    <h3 className="mt-4 font-heading text-2xl font-black uppercase">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDateTime(event.starts_at)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="neo-card p-5 text-sm text-muted-foreground">
                No events have been created for this club yet.
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
