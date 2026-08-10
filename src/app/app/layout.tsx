import NavLinks from "./NavLinks";
import SidebarUserButton from "./SidebarUserButton";
import { Bot } from "lucide-react";

export const metadata = {
  title: "ServeOps AI — Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">ServeOps AI</div>
              <div className="text-xs text-slate-500 leading-tight">AI Operating Team</div>
            </div>
          </div>
        </div>

        <NavLinks />

        {/* User + Footer */}
        <div className="mt-auto border-t border-slate-800">
          <SidebarUserButton />
          <div className="px-4 py-2 border-t border-slate-800">
            <div className="text-xs text-slate-600">AIT × Tencent Hackathon 2026</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-950">
        {children}
      </main>
    </div>
  );
}
