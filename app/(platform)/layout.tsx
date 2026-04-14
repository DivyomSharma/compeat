import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";
import { getDisplayName, requireActiveSchool } from "@/lib/auth";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await requireActiveSchool();
  const roleLabel = viewer.roles.join(" · ") || "student";

  return (
    <SiteShell
      userName={getDisplayName(viewer.profile, viewer.email)}
      schoolName={viewer.activeSchool?.name || "Campus workspace"}
      roleLabel={roleLabel}
      actions={
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      }
    >
      {children}
    </SiteShell>
  );
}
