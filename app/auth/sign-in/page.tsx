import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { RequestOtpForm } from "@/features/auth/components/request-otp-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <BrandMark />
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="neo-card p-6 md:p-8">
            <div className="neo-kicker">Student + organizer auth</div>
            <h1 className="mt-5 font-heading text-4xl font-black uppercase">
              Sign in with email OTP
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              No password fatigue. Enter your campus email, receive a one-time
              code, and continue into your institution workspace.
            </p>
          </section>

          <section className="neo-card p-6 md:p-8">
            <h2 className="font-heading text-2xl font-black uppercase">
              Continue to Compeat
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll send a one-time password to your inbox.
            </p>
            <div className="mt-6">
              <RequestOtpForm next={next} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
