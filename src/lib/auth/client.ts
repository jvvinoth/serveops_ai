"use client";
import { createAuthClient } from "@neondatabase/auth/next";

// createAuthClient reads NEXT_PUBLIC_NEON_AUTH_URL automatically
export const authClient = createAuthClient();
