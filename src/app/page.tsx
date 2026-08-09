import Link from "next/link";
import {
  MessageSquare,
  Bot,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Package,
  Calendar,
  Megaphone,
  Phone,
  Zap,
  Shield,
  Clock,
  DollarSign,
} from "lucide-react";

export const metadata = {
  title: "ServeOps AI — AI Operating Team for SMEs",
  description:
    "Turns WhatsApp orders into quotes, tasks, stock alerts, and owner-approved business actions. Built for F&B, tuition, clinics, and any business that runs on WhatsApp.",
};

const AGENTS = [
  {
    name: "Sales Agent",
    desc: "Detects leads, extracts order details, drafts quotes and customer replies.",
    icon: DollarSign,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    tag: "Revenue",
  },
  {
    name: "Ops Agent",
    desc: "Checks inventory, flags stockout risks, reviews staff/prep capacity.",
    icon: Package,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    tag: "Operations",
  },
  {
    name: "Admin Agent",
    desc: "Creates task lists, staff reminders, and calendar entries automatically.",
    icon: Calendar,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    tag: "Admin",
  },
  {
    name: "Marketing Agent",
    desc: "Drafts promos, review replies, and WhatsApp broadcast copy.",
    icon: Megaphone,
    color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    tag: "Growth",
  },
  {
    name: "Call Agent",
    desc: "Recommends follow-up calls and generates step-by-step call scripts.",
    icon: Phone,
    color: "text-green-400 bg-green-500/10 border-green-500/20",
    tag: "Follow-up",
  },
];

const DEMO_STEPS = [
  {
    num: "01",
    title: "Message Arrives",
    body: "\"Can you cater lunch for 40 pax this Friday at our office?\"",
    label: "WhatsApp Inbound",
    color: "border-slate-600 text-slate-400",
  },
  {
    num: "02",
    title: "AI Router Classifies",
    body: "Intent: catering_inquiry · Urgency: high · Est. Value: SGD 480 · Missing: delivery time, dietary split",
    label: "Router Agent",
    color: "border-emerald-600 text-emerald-400",
  },
  {
    num: "03",
    title: "Agents Work in Parallel",
    body: "Sales drafts quote · Ops checks chicken stock & Friday staff · Admin creates prep tasks · Call Agent writes confirmation script",
    label: "5 Agents",
    color: "border-blue-600 text-blue-400",
  },
  {
    num: "04",
    title: "Owner Approves",
    body: "Dashboard shows quote, stock alert, task list, and call script. Owner taps Approve — reply sent.",
    label: "Approval Queue",
    color: "border-purple-600 text-purple-400",
  },
];

const PAIN_POINTS = [
  "Customer inquiries get missed or replied hours late",
  "Quotes are slow — typed manually each time",
  "Stock and staffing problems appear only after confirming",
  "Follow-ups are forgotten and leads are lost",
  "Owners do sales, admin, ops, and marketing manually",
];

const VERTICALS = [
  { name: "F&B", desc: "Cafes, restaurants, catering, hawker brands", active: true },
  { name: "Tuition", desc: "Class bookings, parent follow-ups, schedules", active: false },
  { name: "Salons", desc: "Appointment bookings, retail promos, reminders", active: false },
  { name: "Clinics", desc: "Appointment triage, referrals, patient follow-up", active: false },
  { name: "Renovation", desc: "Quote requests, supplier coordination, milestones", active: false },
  { name: "Retail", desc: "Product inquiries, stock checks, order follow-up", active: false },
];

const IMPACT = [
  { icon: Clock, stat: "Minutes", label: "First response time", sub: "Down from hours" },
  { icon: TrendingUp, stat: "70%", label: "Faster quote prep", sub: "Compared to manual" },
  { icon: CheckCircle, stat: "0", label: "Missed follow-ups", sub: "Every lead tracked" },
  { icon: Zap, stat: "5", label: "AI agents per message", sub: "Working in parallel" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/8 bg-slate-950/90 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-bold text-white">ServeOps AI</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <a href="#problem" className="hover:text-white transition-colors">Problem</a>
          <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          <a href="#agents" className="hover:text-white transition-colors">Agents</a>
          <a href="#impact" className="hover:text-white transition-colors">Impact</a>
          <a href="/architecture" className="hover:text-white transition-colors">Architecture</a>
        </div>
        <Link
          href="/app"
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
        >
          Live Demo <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 text-emerald-400 text-sm mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AIT × Tencent Hackathon 2026 · Business Agent Track
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-[1.08] mb-6 tracking-tight">
          AI Operating Team
          <br />
          <span className="text-emerald-400">for SMEs</span>
        </h1>

        <p className="text-xl text-slate-300 mb-3 max-w-2xl mx-auto leading-relaxed">
          ServeOps AI turns WhatsApp customer messages into quotes, tasks,
          stock alerts, and owner-approved business actions.
        </p>
        <p className="text-slate-500 mb-12 text-sm">
          Built for F&amp;B, tuition, clinics, salons, and any business that runs on WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/app"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2"
          >
            Try Live Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/demo"
            className="border border-white/15 hover:border-white/30 bg-white/5 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            See How It Works
          </Link>
        </div>

        {/* Hero mockup */}
        <div className="relative max-w-3xl mx-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl shadow-black/60">
            {/* mock header */}
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 text-center text-xs text-slate-500">serveops.ai/app/inbox</div>
            </div>
            {/* mock content */}
            <div className="p-5 grid grid-cols-5 gap-4 text-left min-h-[180px]">
              {/* message bubble */}
              <div className="col-span-2 space-y-2">
                <div className="text-xs text-slate-500 font-medium mb-1">Inbox</div>
                <div className="bg-slate-800 rounded-lg p-2.5 border border-slate-700 border-l-2 border-l-emerald-500">
                  <div className="text-xs font-medium text-white">David Tan · Tech Corp SG</div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    Can you cater lunch for 40 pax this Friday?
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">HIGH</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">SGD 480</span>
                  </div>
                </div>
              </div>
              {/* agent cards */}
              <div className="col-span-3 space-y-2">
                <div className="text-xs text-slate-500 font-medium mb-1">AI Analysis — 4 actions pending</div>
                {[
                  { type: "quote", label: "Sales Agent", text: "Quote ready: SGD 480 for 40 lunch sets", color: "border-blue-700 bg-blue-950/40" },
                  { type: "ops", label: "Ops Agent", text: "Stock OK · Needs 1 extra staff Friday", color: "border-orange-700 bg-orange-950/40" },
                  { type: "call", label: "Call Agent", text: "Call script: confirm delivery time + dietary split", color: "border-green-700 bg-green-950/40" },
                ].map((c) => (
                  <div key={c.type} className={`rounded-lg border p-2 text-xs flex items-center gap-2 ${c.color}`}>
                    <div className="flex-1">
                      <span className="text-slate-400">{c.label}: </span>
                      <span className="text-slate-200">{c.text}</span>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <span className="bg-emerald-700/80 text-white px-2 py-0.5 rounded text-xs font-medium">Approve</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* glow */}
          <div className="absolute -inset-4 bg-emerald-500/5 rounded-3xl blur-2xl -z-10" />
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" className="max-w-5xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">The Problem</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              SMEs run on WhatsApp.<br />
              <span className="text-slate-400">WhatsApp wasn&apos;t built for that.</span>
            </h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              F&amp;B owners manage customer orders, catering inquiries, supplier
              coordination, staffing, reviews, and promotions — all through WhatsApp
              and spreadsheets. Important work gets missed every day.
            </p>
            <ul className="space-y-3">
              {PAIN_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  </div>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            {/* WhatsApp chaos mockup */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <div className="text-xs text-slate-500 mb-3 font-medium">Owner&apos;s typical morning — WhatsApp</div>
              {[
                { from: "David Tan", msg: "Can you cater 40 pax Friday?", time: "8:02 AM", unread: true },
                { from: "Supplier Lim", msg: "Chicken delivery delayed to tomorrow", time: "8:14 AM", unread: true },
                { from: "Jane (staff)", msg: "I can't make Friday morning shift", time: "8:31 AM", unread: true },
                { from: "Google Review", msg: "New 3-star review — no response yet", time: "9:05 AM", unread: true },
              ].map((m) => (
                <div key={m.from} className="flex items-start gap-3 py-2.5 border-b border-slate-800 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0 text-slate-300">
                    {m.from[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{m.from}</span>
                      <span className="text-xs text-slate-500">{m.time}</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">{m.msg}</div>
                  </div>
                  {m.unread && <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />}
                </div>
              ))}
              <div className="mt-3 text-center text-xs text-slate-600">+ 12 more unread</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO FLOW ── */}
      <section id="demo" className="bg-slate-900/40 border-y border-slate-800 py-20">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">The Demo</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From WhatsApp inquiry to approved action
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Watch how a single catering message triggers 5 AI agents and produces
              a quote, ops check, task list, and call script in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {DEMO_STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < DEMO_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-slate-600 to-transparent z-10" />
                )}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
                  <div className={`text-xs font-bold mb-2 border px-2 py-0.5 rounded-full inline-block ${step.color}`}>
                    {step.label}
                  </div>
                  <div className="text-sm font-semibold text-white mb-2">{step.title}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Try the Live Demo
            </Link>
            <p className="text-xs text-slate-600 mt-3">No login required · Demo data preloaded</p>
          </div>
        </div>
      </section>

      {/* ── AGENTS ── */}
      <section id="agents" className="max-w-5xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <div className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">The Team</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">5 AI Agents, 1 Platform</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Each agent is specialized for a distinct business function.
            They work in parallel, then surface recommendations for owner approval.
          </p>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.name}
                className={`bg-slate-900 border rounded-xl p-5 flex flex-col gap-3 ${agent.color.includes("border") ? "" : "border-slate-800"}`}
              >
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${agent.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-0.5">{agent.tag}</div>
                  <div className="font-semibold text-sm text-white">{agent.name}</div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{agent.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-slate-900/40 border-y border-slate-800 py-20">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">How It Works</div>
            <h2 className="text-3xl md:text-4xl font-bold">Connect. Receive. Route. Approve. Act.</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { n: "1", title: "Connect WhatsApp", desc: "Scan QR with your demo number. Production uses Meta WhatsApp Business API.", icon: MessageSquare },
              { n: "2", title: "Receive Messages", desc: "Customer orders, inquiries, supplier updates — everything lands in one inbox.", icon: Bot },
              { n: "3", title: "AI Routes Work", desc: "Router classifies intent, urgency, and value. Sends to relevant agents.", icon: Zap },
              { n: "4", title: "Owner Reviews", desc: "All recommendations shown in one approval queue. Nothing goes out unreviewed.", icon: Shield },
              { n: "5", title: "Business Acts", desc: "Approved reply sent. Quote generated. Tasks created. Stock alerts raised.", icon: CheckCircle },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-xs text-emerald-400 font-bold mb-1">Step {step.n}</div>
                  <div className="font-semibold text-sm text-white mb-1">{step.title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section id="impact" className="max-w-5xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <div className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">Business Impact</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Less admin. More revenue. Fewer surprises.</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {IMPACT.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                <Icon className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{item.stat}</div>
                <div className="text-sm font-medium text-slate-300">{item.label}</div>
                <div className="text-xs text-slate-500 mt-1">{item.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Trust line */}
        <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-6 text-center">
          <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
          <div className="text-lg font-semibold text-white mb-1">Important actions stay owner-approved.</div>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            ServeOps AI never sends a message, creates a quote, or raises an alert
            without explicit owner approval. You stay in control.
          </p>
        </div>
      </section>

      {/* ── EXPANSION ── */}
      <section className="bg-slate-900/40 border-y border-slate-800 py-20">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-10">
            <div className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">Expansion</div>
            <h2 className="text-3xl font-bold mb-3">Starting with F&amp;B. Built to scale.</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              The same WhatsApp front-desk + AI operating-team model works across any
              service SME. The business data, prompts, and workflows adapt by vertical.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {VERTICALS.map((v) => (
              <div
                key={v.name}
                className={`rounded-xl border p-4 text-center transition-colors ${
                  v.active
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-900 border-slate-800 opacity-60"
                }`}
              >
                <div className={`font-semibold text-sm mb-1 ${v.active ? "text-emerald-300" : "text-slate-400"}`}>
                  {v.name}
                  {v.active && <span className="ml-1 text-emerald-500 text-xs">●</span>}
                </div>
                <div className="text-xs text-slate-500 leading-snug">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="max-w-3xl mx-auto px-8 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          SMEs don&apos;t need another chatbot.
          <br />
          <span className="text-emerald-400">They need an operating team.</span>
        </h2>
        <p className="text-slate-400 mb-10 text-lg">
          ServeOps AI gives every SME an AI Sales, Ops, Admin, Marketing, and Call team
          that turns messages into action.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/app"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
          >
            Open Live Demo <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/architecture"
            className="border border-white/15 hover:border-white/30 bg-white/5 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors"
          >
            Architecture
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-600">
          Prototype uses a demo connector. Production uses Meta WhatsApp Business Cloud API.
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-white">ServeOps AI</span>
          </div>
          <div>Built with CodeBuddy · AIT × Tencent Hackathon Singapore 2026</div>
          <div className="flex gap-4">
            <Link href="/app" className="hover:text-white transition-colors">Demo</Link>
            <Link href="/architecture" className="hover:text-white transition-colors">Architecture</Link>
            <Link href="/demo" className="hover:text-white transition-colors">How It Works</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
