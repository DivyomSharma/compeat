import { FileBadge2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  generateCertificateAction,
  reviewRegistrationAction,
} from "@/features/events/actions";
import type { Registration } from "@/lib/types";
import { formatRoleLabel } from "@/lib/utils";

export function RegistrationReviewTable({
  eventId,
  registrations,
  schoolNames = {},
}: {
  eventId: string;
  registrations: Registration[];
  schoolNames?: Record<string, string>;
}) {
  if (!registrations.length) {
    return (
      <div className="neo-card p-6">
        <h3 className="font-heading text-2xl font-black uppercase">
          No registrations yet
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          As students register, approvals and certificate actions will show up
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border-[3px] border-border bg-card shadow-[6px_6px_0_0_var(--border)]">
      <table className="w-full border-collapse">
        <thead className="bg-muted">
          <tr className="border-b-[3px] border-border text-left">
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.2em]">
              Student
            </th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.2em]">
              School
            </th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.2em]">
              Notes
            </th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.2em]">
              Status
            </th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.2em]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((registration) => (
            <tr
              key={registration.id}
              className="border-b border-border/15 align-top"
            >
              <td className="px-4 py-4">
                <div className="font-semibold">
                  {registration.users?.display_name ||
                    registration.users?.full_name ||
                    registration.users?.email}
                </div>
                <div className="text-sm text-muted-foreground">
                  {registration.users?.email}
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-muted-foreground">
                {registration.participant_school_id
                  ? (schoolNames[registration.participant_school_id] ?? "Other campus")
                  : "External"}
              </td>
              <td className="px-4 py-4 text-sm text-muted-foreground">
                {registration.notes || "No note"}
              </td>
              <td className="px-4 py-4">
                <Badge
                  variant={
                    registration.status === "approved" ? "secondary" : "outline"
                  }
                >
                  {formatRoleLabel(registration.status)}
                </Badge>
              </td>
              <td className="space-y-2 px-4 py-4">
                <form
                  action={reviewRegistrationAction}
                  className="flex flex-wrap gap-2"
                >
                  <input type="hidden" name="registrationId" value={registration.id} />
                  <input type="hidden" name="eventId" value={eventId} />
                  <Button type="submit" name="status" value="approved" size="sm">
                    Approve
                  </Button>
                  <Button
                    type="submit"
                    name="status"
                    value="rejected"
                    size="sm"
                    variant="outline"
                  >
                    Reject
                  </Button>
                </form>
                {registration.status === "approved" ? (
                  <form
                    action={generateCertificateAction.bind(
                      null,
                      registration.id,
                      eventId
                    )}
                  >
                    <Button type="submit" variant="secondary" size="sm">
                      <FileBadge2 />
                      {registration.certificate_path
                        ? "Regenerate certificate"
                        : "Generate certificate"}
                    </Button>
                  </form>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
