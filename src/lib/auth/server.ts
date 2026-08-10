import { createNeonAuth } from "@neondatabase/auth/next/server";

// Lazy singleton — instantiated on first call so build-time static analysis
// doesn't throw "missing cookie secret" when env vars aren't set.
let _neonAuth: ReturnType<typeof createNeonAuth> | null = null;

function getNeonAuth() {
  if (!_neonAuth) {
    _neonAuth = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_URL || "https://placeholder.neonauth.tech",
      cookies: {
        secret: process.env.AUTH_COOKIE_SECRET || "placeholder-secret-for-build-time-only-32",
      },
    });
  }
  return _neonAuth;
}

// Proxy object — all property accesses are forwarded to the lazy instance
export const neonAuth = new Proxy({} as ReturnType<typeof createNeonAuth>, {
  get(_target, prop) {
    return (getNeonAuth() as Record<string | symbol, unknown>)[prop];
  },
});
