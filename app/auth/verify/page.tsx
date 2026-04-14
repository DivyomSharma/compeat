import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { email = "", next } = await searchParams;

  return (
    <div className="min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <BrandMark />
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="size-4" />
            Change email
          </Link>
        </div>

        <section className="neo-card mx-auto max-w-xl p-6 md:p-8">
          <div className="neo-kicker">OTP verification</div>
          <h1 className="mt-5 font-heading text-4xl font-black uppercase">
            Enter the code we sent
          </h1>
          <p className="mt-4 text-muted-foreground">
            Check <span className="font-semibold text-foreground">{email}</span>{" "}
            for your one-time password or magic link.
          </p>
          <div className="mt-6">
            <VerifyOtpForm email={email} next={next} />
          </div>
        </section>
      </div>
    </div>
  );
}
