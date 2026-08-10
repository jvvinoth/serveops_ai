import { createNeonAuth } from "@neondatabase/auth/next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_URL || "https://placeholder.neonauth.tech",
    cookies: {
      secret: process.env.AUTH_COOKIE_SECRET || "placeholder-secret-for-build-time-only-32",
    },
  });

  const protect = auth.middleware({ loginUrl: "/auth/sign-in" });
  return protect(request);
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};
