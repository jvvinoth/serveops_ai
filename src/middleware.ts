import { createNeonAuth } from "@neondatabase/auth/next/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const baseUrl = process.env.NEON_AUTH_URL || process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.AUTH_COOKIE_SECRET || process.env.NEON_AUTH_COOKIE_SECRET;

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !baseUrl || !secret) {
    return NextResponse.next();
  }

  const auth = createNeonAuth({
    baseUrl,
    cookies: {
      secret,
    },
  });

  const protect = auth.middleware({ loginUrl: "/auth/sign-in" });
  return protect(request);
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};
