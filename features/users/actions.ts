"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type ActionState } from "@/lib/action-state";
import { requireActiveSchool } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters."),
  headline: z.string().max(100).optional(),
  public_email: z.union([z.string().email("Enter a valid email."), z.literal("")]).optional(),
  website: z.union([z.string().url("Enter a valid URL."), z.literal("")]).optional(),
  instagram: z.string().max(30).optional(),
});

export async function updateProfileAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name"),
    headline: formData.get("headline") || undefined,
    public_email: formData.get("public_email") || undefined,
    website: formData.get("website") || undefined,
    instagram: formData.get("instagram") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Please review your inputs.",
    };
  }

  const viewer = await requireActiveSchool();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("users")
    .update({
      display_name: parsed.data.display_name,
      headline: parsed.data.headline || null,
      public_email: parsed.data.public_email || null,
      website: parsed.data.website || null,
      instagram: parsed.data.instagram || null,
    })
    .eq("id", viewer.authUserId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Profile updated successfully.",
  };
}
