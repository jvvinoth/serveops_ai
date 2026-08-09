"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, CheckSquare, Wifi } from "lucide-react";

const links = [
  { href: "/app", label: "Command Center", icon: LayoutDashboard },
  { href: "/app/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/app/approvals", label: "Approvals", icon: CheckSquare },
  { href: "/app/connect", label: "WhatsApp", icon: Wifi },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-3 space-y-0.5">
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">Menu</div>
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/app" ? pathname === "/app" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active
                ? "bg-green-500/10 text-green-400 font-medium"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
