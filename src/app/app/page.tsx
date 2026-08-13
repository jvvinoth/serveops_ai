"use client";
import { useEffect, useState } from "react";
import { Bot, MessageSquare, Clock, Users, Play, RefreshCw, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

interface Stats {
  totalConversations: number;
  openConversations: number;
  pendingApprovals: number;
  agentRunsToday: number;
  messagesTotal: number;
  activeAgents: number;
}

const DEMO_SCENARIOS = [
  {
    id: "agency_project",
    label: "Digital Agency — Full Project Inquiry",
    desc: "New lead wants logo, website & ad campaign",
    color: "text-indigo-400",
    phone: "+6591234567",
    name: "Amelia Tan",
    message:
      "Hi, I found you on Instagram. I'm opening a new café next month and need a full branding package — logo, website, and a social media launch campaign. Can you share your packages and pricing? Looking to get started ASAP.",
  },
  {
    id: "catering_order",
    label: "F&B Catering — Event Order",
    desc: "Corporate client requests catering quote",
    color: "text-blue-400",
    phone: "+6598765432",
    name: "David Lim",
    message:
      "Hi, I'm David from TechCorp SG. We need catering for 50 pax on 20 Aug for our product launch dinner. Looking for a buffet set with halal options. What are your packages and can you confirm availability?",
  },
  {
    id: "insurance_lead",
    label: "Insurance — Policy Inquiry",
    desc: "Prospect asks about life insurance options",
    color: "text-teal-400",
    phone: "+6581234567",
    name: "Priya Nair",
    message:
      "Hello, a friend recommended you. I'm 32 years old and looking to get my first life insurance policy. Not sure whether to go for term or whole life. Can you explain the difference and share some options that suit my budget of around $200/month?",
  },
  {
    id: "renovation_quote",
    label: "Renovation — HDB Quote Request",
    desc: "Homeowner asks for renovation package",
    color: "text-amber-400",
    phone: "+6592345678",
    name: "Jason Ong",
    message:
      "Hi, just got my BTO keys! 4-room HDB at Tampines. Looking for a full renovation — living room, kitchen, 2 bedrooms and bathrooms. What's your typical package for this? When can we schedule a site visit?",
  },
];

export default function CommandCenter() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 8000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const runScenario = async (s: (typeof DEMO_SCENARIOS)[0]) => {
    setRunningScenario(s.id);
    try {
      const res = await fetch("/api/messages/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: s.phone,
          name: s.name,
          message: s.message,
          source: "simulator",
        }),
      });
      if (res.ok) {
        showToast("success", `"${s.label}" triggered — AI pipeline running`);
        setTimeout(loadStats, 2000);
      } else {
        showToast("error", "Failed to trigger scenario");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setRunningScenario(null);
    }
  };

  const resetDemo = async () => {
    if (!confirm("Reset all demo data? This deletes all conversations and agent runs.")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/demo", { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Demo data reset successfully");
        setTimeout(loadStats, 500);
      }
    } finally {
      setResetting(false);
    }
  };

  const statCards = stats
    ? [
        {
          label: "Conversations",
          value: stats.totalConversations,
          sub: `${stats.openConversations} open`,
          icon: MessageSquare,
          color: "text-blue-400",
          ring: "ring-blue-500/20",
        },
        {
          label: "Pending Approvals",
          value: stats.pendingApprovals,
          sub: "awaiting action",
          icon: Clock,
          color: "text-amber-400",
          ring: "ring-amber-500/20",
        },
        {
          label: "Agent Runs Today",
          value: stats.agentRunsToday,
          sub: "AI analyses run",
          icon: Bot,
          color: "text-green-400",
          ring: "ring-green-500/20",
        },
        {
          label: "Active Agents",
          value: stats.activeAgents,
          sub: "Sales · Proposal · Invoice · Call · Admin · Mktg",
          icon: Users,
          color: "text-purple-400",
          ring: "ring-purple-500/20",
        },
      ]
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border ${
            toast.type === "success"
              ? "bg-green-950 text-green-200 border-green-800"
              : "bg-red-950 text-red-200 border-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Command Center</h1>
        <p className="text-slate-400 text-sm mt-1">
          ServeOps AI · Your AI Operating Team for Any SME
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-xl p-4 animate-pulse h-24" />
            ))
          : statCards.map(({ label, value, sub, icon: Icon, color, ring }) => (
              <div
                key={label}
                className={`bg-slate-800 rounded-xl p-4 border border-slate-700 ring-1 ${ring}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                    {label}
                  </span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-500 mt-1">{sub}</div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demo Scenarios */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white">Demo Scenarios</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulates WhatsApp → triggers full AI pipeline
              </p>
            </div>
            <button
              onClick={resetDemo}
              disabled={resetting}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${resetting ? "animate-spin" : ""}`} />
              Reset
            </button>
          </div>
          <div className="space-y-2">
            {DEMO_SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => runScenario(s)}
                disabled={!!runningScenario}
                className="w-full flex items-start gap-3 p-3 rounded-lg bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors text-left disabled:opacity-60"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {runningScenario === s.id ? (
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className={`w-4 h-4 ${s.color}`} />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{s.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Agent Status */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h2 className="font-semibold text-white mb-4">Agent Status</h2>
          <div className="space-y-3">
            {[
              { label: "Sales Agent", desc: "Lead qualification · quotes · WhatsApp replies", color: "bg-blue-400" },
              { label: "Proposal Agent", desc: "Pitch decks · service proposals", color: "bg-indigo-400" },
              { label: "Invoice Agent", desc: "Invoice drafts · payment terms", color: "bg-emerald-400" },
              { label: "Call Agent", desc: "Call scripts · appointment slots", color: "bg-teal-400" },
              { label: "Admin Agent", desc: "Follow-up tasks · calendar blocks", color: "bg-purple-400" },
              { label: "Marketing Agent", desc: "Promos · review replies · broadcasts", color: "bg-pink-400" },
            ].map(({ label, desc, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`}
                  style={{ boxShadow: "0 0 6px currentColor" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium">{label}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-400">
                  ready
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-700 space-y-2">
            {[
              { label: "OpenRouter LLM", status: "connected", ok: true },
              { label: "Neon Database", status: "connected", ok: true },
              { label: "WhatsApp Business", status: "see /connect", ok: false },
            ].map(({ label, status, ok }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{label}</span>
                <span className={ok ? "text-green-400 font-medium" : "text-amber-400"}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline diagram */}
      <div className="mt-6 bg-slate-900 rounded-xl border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <h2 className="text-sm font-semibold text-white">AI Pipeline</h2>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { label: "WhatsApp / Simulator", color: "bg-slate-700" },
            { label: "→", plain: true },
            { label: "Router Agent", color: "bg-green-900/50 border border-green-800 text-green-300" },
            { label: "→", plain: true },
            { label: "6 Parallel Agents", color: "bg-blue-900/50 border border-blue-800 text-blue-300" },
            { label: "→", plain: true },
            { label: "Approval Queue", color: "bg-amber-900/50 border border-amber-800 text-amber-300" },
            { label: "→", plain: true },
            { label: "Human Review", color: "bg-purple-900/50 border border-purple-800 text-purple-300" },
            { label: "→", plain: true },
            { label: "Auto-Reply", color: "bg-slate-700" },
          ].map((step, i) =>
            step.plain ? (
              <span key={i} className="text-slate-600 text-xs">
                {step.label}
              </span>
            ) : (
              <span
                key={i}
                className={`text-xs px-2.5 py-1 rounded-full text-slate-200 ${step.color}`}
              >
                {step.label}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
