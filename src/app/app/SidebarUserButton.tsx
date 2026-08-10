"use client";
import { UserButton, useAuthData } from "@neondatabase/auth/react";

export default function SidebarUserButton() {
  const { user } = useAuthData();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <UserButton />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {user.name || user.email}
        </div>
        <div className="text-xs text-slate-500 truncate">{user.email}</div>
      </div>
    </div>
  );
}
