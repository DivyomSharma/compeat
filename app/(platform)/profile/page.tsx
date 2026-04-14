import { requireActiveSchool } from "@/lib/auth";
import { EditProfileForm } from "@/features/users/components/edit-profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ProfilePage() {
  const viewer = await requireActiveSchool();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="neo-kicker">Settings & social</div>
          <h1 className="mt-4 font-heading text-4xl font-black uppercase">
            Edit your profile
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Connect your socials and configure how your campus views you.
          </p>
        </div>
      </div>

      <div className="neo-card p-6 md:p-8 space-y-8">
        <div className="flex items-center gap-6">
          <Avatar className="size-24 border-[3px] border-border shadow-[4px_4px_0_0_var(--border)]">
            <AvatarImage src={viewer.profile?.avatar_url || undefined} />
            <AvatarFallback className="font-heading text-3xl font-black">
              {viewer.profile?.full_name?.[0] || viewer.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight">
              {viewer.profile?.display_name || viewer.profile?.full_name || viewer.email}
            </h2>
            <p className="text-muted-foreground">
              {viewer.activeSchool?.name}
            </p>
          </div>
        </div>

        <EditProfileForm profile={viewer.profile || {}} />
      </div>
    </div>
  );
}
