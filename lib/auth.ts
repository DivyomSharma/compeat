import { redirect } from "next/navigation";

import { demoSchools } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/config";
import type { AppUser, Membership, MembershipRole, School } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ViewerContext = {
  authUserId: string;
  email: string;
  profile: AppUser | null;
  memberships: Membership[];
  activeSchool: School | null;
  activeSchoolId: string | null;
  roles: MembershipRole[];
};

async function ensureUserProfile(
  userId: string,
  email: string,
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
) {
  await supabase
    .from("users")
    .upsert({ id: userId, email }, { onConflict: "id" })
    .select("id")
    .maybeSingle();
}

export async function getViewerContext(): Promise<ViewerContext | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  await ensureUserProfile(user.id, user.email, supabase);

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("memberships")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active"),
  ]);

  const activeSchoolId = profile?.school_id ?? memberships?.[0]?.school_id ?? null;

  const schoolResponse = activeSchoolId
    ? await supabase.from("schools").select("*").eq("id", activeSchoolId).maybeSingle()
    : { data: null };

  const roles = Array.from(
    new Set((memberships ?? []).flatMap((membership) => membership.roles ?? []))
  ) as MembershipRole[];

  return {
    authUserId: user.id,
    email: user.email,
    profile: profile ?? null,
    memberships: memberships ?? [],
    activeSchool: schoolResponse.data ?? null,
    activeSchoolId,
    roles,
  };
}

export async function requireViewerContext() {
  const viewer = await getViewerContext();

  if (!viewer) {
    redirect("/auth/sign-in");
  }

  return viewer;
}

export async function requireActiveSchool() {
  const viewer = await requireViewerContext();

  if (!viewer.activeSchoolId) {
    redirect("/onboarding");
  }

  return viewer;
}

export function getDisplayName(
  profile: Pick<AppUser, "display_name" | "full_name"> | null,
  email: string
) {
  return (
    profile?.display_name ||
    profile?.full_name ||
    email.split("@")[0] ||
    "Campus user"
  );
}

export function getSetupSchoolFallback() {
  return demoSchools[0];
}
