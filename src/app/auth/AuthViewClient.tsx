"use client";
import { AuthView } from "@neondatabase/auth/react";

export default function AuthViewClient({ path }: { path: "SIGN_IN" | "SIGN_UP" | "FORGOT_PASSWORD" | "RESET_PASSWORD" }) {
  return <AuthView path={path} />;
}
