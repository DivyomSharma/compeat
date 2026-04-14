import Link from "next/link";
import { Award, CalendarClock, Trophy, Users2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireActiveSchool } from "@/lib/auth";
import {
  getDashboardDataForUser,
  getSignedCertificateUrl,
} from "@/lib/supabase/queries";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const viewer = await requireActiveSchool();
  const data = await getDashboardDataForUser(
    viewer.authUserId,
    viewer.activeSchoolId!
  );

  const certificates = await Promise.all(
    data.certificates.map(async (registration) => ({
      ...registration,
      signedUrl: await getSignedCertificateUrl(registration.certificate_path),
    }))
  );

  return (
    <div className="space-y-6">
      <section>
        <div className="neo-kicker">Student dashboard</div>
        <h1 className="mt-4 font-heading text-4xl font-black uppercase">
          Your clubs, events, and certificates in one view.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Track what you&apos;re part of, what&apos;s coming up next, and what
          you&apos;ve already earned.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users2} label="Joined clubs" value={data.clubs.length} />
        <StatCard
          icon={CalendarClock}
          label="Upcoming events"
          value={data.events.length}
          accent="bg-secondary text-secondary-foreground"
        />
        <StatCard
          icon={Trophy}
          label="Registrations"
          value={data.registrations.length}
          accent="bg-accent text-accent-foreground"
        />
        <StatCard
          icon={Award}
          label="Certificates"
          value={certificates.length}
          accent="bg-[var(--surface-yellow)]"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-black uppercase">
              Joined clubs
            </h2>
            <Button asChild variant="outline">
              <Link href="/clubs">Open clubs</Link>
            </Button>
          </div>
          {data.clubs.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {data.clubs.map((club) => (
                <article key={club.id} className="neo-card p-5">
                  <Badge>{club.category}</Badge>
                  <h3 className="mt-4 font-heading text-2xl font-black uppercase">
                    {club.name}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {club.description}
                  </p>
                  <Button asChild className="mt-5">
                    <Link href={`/clubs/${club.id}`}>Open dashboard</Link>
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users2}
              title="No clubs yet"
              description="Join your first club to start seeing member activity, role assignments, and club-led events."
              action={
                <Button asChild>
                  <Link href="/clubs">Browse clubs</Link>
                </Button>
              }
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-black uppercase">
              Registered events
            </h2>
            <Button asChild variant="outline">
              <Link href="/events">Open events</Link>
            </Button>
          </div>
          {data.registrations.length ? (
            <div className="space-y-4">
              {data.registrations.map((registration) => (
                <article key={registration.id} className="neo-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge
                        variant={
                          registration.status === "approved"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {registration.status}
                      </Badge>
                      <h3 className="mt-4 font-heading text-2xl font-black uppercase">
                        {registration.events?.title}
                      </h3>
                    </div>
                    <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {formatDateTime(registration.events?.starts_at)}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Venue: {registration.events?.venue}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No registrations yet"
              description="Once you register for competitions or events, they’ll appear here with approval status."
            />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-black uppercase">
            Certificates
          </h2>
        </div>
        {certificates.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <article key={certificate.id} className="neo-card p-5">
                <Badge variant="secondary">Issued</Badge>
                <h3 className="mt-4 font-heading text-2xl font-black uppercase">
                  {certificate.events?.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Certificate available for download.
                </p>
                {certificate.signedUrl ? (
                  <Button asChild className="mt-5">
                    <a href={certificate.signedUrl} target="_blank" rel="noreferrer">
                      View certificate
                    </a>
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Award}
            title="No certificates yet"
            description="Approved participants with generated certificates will see download links here."
          />
        )}
      </section>
    </div>
  );
}
