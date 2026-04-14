"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type ActionState } from "@/lib/action-state";
import { requireViewerContext } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/utils";

const onboardingSchema = z
  .object({
    mode: z.enum(["create", "join"]),
    schoolId: z.string().optional(),
    schoolName: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    description: z.string().optional(),
  })
  .superRefine((data, context) => {
    if (data.mode === "join" && !data.schoolId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a school to join.",
        path: ["schoolId"],
      });
    }

    if (data.mode === "create") {
      if (!data.schoolName) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter your institution name.",
          path: ["schoolName"],
        });
      }

      if (!data.city) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the city for this institution.",
          path: ["city"],
        });
      }

      if (!data.country) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the country for this institution.",
          path: ["country"],
        });
      }
    }
  });

export async function onboardSchoolAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = onboardingSchema.safeParse({
    mode: formData.get("mode"),
    schoolId: formData.get("schoolId") || undefined,
    schoolName: formData.get("schoolName") || undefined,
    city: formData.get("city") || undefined,
    country: formData.get("country") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Finish the onboarding form.",
    };
  }

  const viewer = await requireViewerContext();
  const supabase = await createServerSupabaseClient();

  let selectedSchoolId = parsed.data.schoolId;

  if (parsed.data.mode === "create") {
    const { data: school, error } = await supabase
      .from("schools")
      .insert({
        name: parsed.data.schoolName,
        slug: toSlug(parsed.data.schoolName!),
        city: parsed.data.city,
        country: parsed.data.country,
        description: parsed.data.description ?? null,
      })
      .select("*")
      .single();

    if (error || !school) {
      return {
        success: false,
        message: error?.message ?? "Unable to create the institution.",
      };
    }

    selectedSchoolId = school.id;
  }

  const roles = parsed.data.mode === "create" ? ["admin", "student"] : ["student"];

  const { error: membershipError } = await supabase.from("memberships").upsert(
    {
      school_id: selectedSchoolId,
      user_id: viewer.authUserId,
      roles,
      status: "active",
    },
    { onConflict: "school_id,user_id" }
  );

  if (membershipError) {
    return {
      success: false,
      message: membershipError.message,
    };
  }

  const { error: profileError } = await supabase
    .from("users")
    .update({ school_id: selectedSchoolId })
    .eq("id", viewer.authUserId);

  if (profileError) {
    return {
      success: false,
      message: profileError.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/clubs");
  revalidatePath("/events");
  redirect("/dashboard");
}
