"use client";
// Auth context provider — no NeonAuthUIProvider needed since we use custom forms
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
