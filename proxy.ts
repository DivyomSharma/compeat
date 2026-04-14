import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clubs/:path*",
    "/events/:path*",
    "/onboarding/:path*",
    "/auth/sign-in",
    "/auth/verify",
  ],
};
