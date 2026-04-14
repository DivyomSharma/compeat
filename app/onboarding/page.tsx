import { redirect } from "next/navigation";

import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";
import { getViewerContext } from "@/lib/auth";
import { getOnboardingSchools } from "@/lib/supabase/queries";

export default async function OnboardingPage() {
  const viewer = await getViewerContext();

  if (!viewer) {
    redirect("/auth/sign-in");
  }

  if (viewer.activeSchoolId) {
    redirect("/dashboard");
  }

  const schools = await getOnboardingSchools();

  return (
    <div className="min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto max-w-4xl">
        <section className="neo-card p-6 md:p-8">
          <div className="neo-kicker">Institution onboarding</div>
          <h1 className="mt-5 font-heading text-4xl font-black uppercase">
            Join your campus or create a new institution
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Every Compeat workspace is campus-aware. Pick the institution you
            belong to, or create a new one and become its first admin.
          </p>

          <div className="mt-8">
            <OnboardingForm schools={schools} />
          </div>
        </section>
      </div>
    </div>
  );
}
