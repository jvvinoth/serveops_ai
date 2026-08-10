import { createNeonAuth } from "@neondatabase/auth/next/server";

// Lazy singleton — instantiated on first request so env vars are available at runtime
let _neonAuth: ReturnType<typeof createNeonAuth> | null = null;

function getNeonAuth() {
  if (!_neonAuth) {
    const secret = process.env.AUTH_COOKIE_SECRET;
    const baseUrl = process.env.NEON_AUTH_URL;

    if (!secret || !baseUrl) {
      // During build-time static analysis — return a no-op placeholder
      // This should never be called at build time since handlers are dynamic
      throw new Error(
        `[neonAuth] Missing env vars: ${!baseUrl ? "NEON_AUTH_URL " : ""}${!secret ? "AUTH_COOKIE_SECRET" : ""}`.trim()
      );
    }

    _neonAuth = createNeonAuth({
      baseUrl,
      cookies: { secret },
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
