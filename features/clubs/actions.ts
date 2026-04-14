"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type ActionState } from "@/lib/action-state";
import { requireActiveSchool } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/utils";

const createClubSchema = z.object({
  name: z.string().min(2, "Club name must be at least 2 characters."),
  category: z.string().min(2, "Choose a category."),
  description: z.string().min(12, "Give students a clear club description."),
  contactEmail: z.string().email("Enter a valid club contact email."),
});

const memberSchema = z.object({
  clubId: z.string().uuid(),
  email: z.string().email("Use the member's campus email."),
  role: z.enum(["club_president", "vice_president", "club_member"]),
});

export async function createClubAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = createClubSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    contactEmail: formData.get("contactEmail"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Check the club form.",
    };
  }

  const viewer = await requireActiveSchool();

  if (!viewer.roles.includes("admin")) {
    return {
      success: false,
      message: "Only school admins can create clubs in this MVP.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: club, error } = await supabase
    .from("clubs")
    .insert({
      school_id: viewer.activeSchoolId,
      name: parsed.data.name,
      slug: toSlug(parsed.data.name),
      category: parsed.data.category,
      description: parsed.data.description,
      contact_email: parsed.data.contactEmail,
      created_by: viewer.authUserId,
    })
    .select("*")
    .single();

  if (error || !club) {
    return {
      success: false,
      message: error?.message ?? "Unable to create club.",
    };
  }

  await supabase.from("club_members").insert({
    school_id: viewer.activeSchoolId,
    club_id: club.id,
    user_id: viewer.authUserId,
    role: "club_president",
  });

  revalidatePath("/clubs");

  return {
    success: true,
    message: "Club created successfully.",
  };
}

export async function addClubMemberAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = memberSchema.safeParse({
    clubId: formData.get("clubId"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Check the member details.",
    };
  }

  const viewer = await requireActiveSchool();
  const supabase = await createServerSupabaseClient();

  const { data: currentMembership } = await supabase
    .from("club_members")
    .select("role")
    .eq("club_id", parsed.data.clubId)
    .eq("user_id", viewer.authUserId)
    .maybeSingle();

  if (
    !viewer.roles.includes("admin") &&
    currentMembership?.role !== "club_president" &&
    currentMembership?.role !== "vice_president"
  ) {
    return {
      success: false,
      message: "Only club leads or admins can manage club members.",
    };
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("users")
    .select("id, school_id, email")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (candidateError || !candidate?.id) {
    return {
      success: false,
      message: "We couldn't find a user with that email inside this workspace.",
    };
  }

  await supabase.from("club_members").upsert(
    {
      school_id: viewer.activeSchoolId,
      club_id: parsed.data.clubId,
      user_id: candidate.id,
      role: parsed.data.role,
    },
    { onConflict: "club_id,user_id" }
  );

  revalidatePath(`/clubs/${parsed.data.clubId}`);

  return {
    success: true,
    message: "Club membership updated.",
  };
}

export async function removeClubMemberAction(clubId: string, userId: string) {
  const viewer = await requireActiveSchool();
  const supabase = await createServerSupabaseClient();

  const { data: currentMembership } = await supabase
    .from("club_members")
    .select("role")
    .eq("club_id", clubId)
    .eq("user_id", viewer.authUserId)
    .maybeSingle();

  if (
    !viewer.roles.includes("admin") &&
    currentMembership?.role !== "club_president" &&
    currentMembership?.role !== "vice_president"
  ) {
    return;
  }

  await supabase
    .from("club_members")
    .delete()
    .eq("club_id", clubId)
    .eq("user_id", userId);

  revalidatePath(`/clubs/${clubId}`);
}
