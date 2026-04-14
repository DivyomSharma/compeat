import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;

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
            Use different email
          </Link>
        </div>

        <section className="neo-card mx-auto max-w-xl p-6 md:p-8">
          <div className="neo-kicker">Magic link sent</div>
          <h1 className="mt-5 font-heading text-4xl font-black uppercase">
            Check your inbox
          </h1>
          <p className="mt-4 text-muted-foreground">
            We sent a sign-in link to{" "}
            {email ? (
              <span className="font-semibold text-foreground">{email}</span>
            ) : (
              "your email"
            )}
            . Click the link in that email to continue into Compeat.
          </p>

          <div className="mt-8 neo-panel flex items-start gap-4 p-5">
            <Mail className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>The link expires in <span className="font-semibold text-foreground">60 minutes</span>.</p>
              <p>If you don&apos;t see it, check your spam folder or request a new link.</p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/auth/sign-in"
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Resend magic link
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
