import { createNeonAuth } from "@neondatabase/auth/next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const auth = createNeonAuth({
    baseUrl: (process.env.NEON_AUTH_URL || process.env.NEON_AUTH_BASE_URL)!,
    cookies: {
      secret: (process.env.AUTH_COOKIE_SECRET || process.env.NEON_AUTH_COOKIE_SECRET)!,
    },
  });

  const protect = auth.middleware({ loginUrl: "/auth/sign-in" });
  return protect(request);
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};
