import Link from "next/link";
import {
  MessageSquare,
  Bot,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Calendar,
  Megaphone,
  Phone,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Receipt,
} from "lucide-react";

export const metadata = {
  title: "ServeOps AI — AI Operating Team for Any SME",
  description:
    "ServeOps AI turns WhatsApp messages into quotes, proposals, invoices, and owner-approved actions. Built for any SME — agencies, F&B, insurance, renovation, tuition, salons.",
};

const AGENTS = [
  {
    name: "Sales Agent",
    desc: "Qualifies leads, extracts requirements, and drafts quotes and WhatsApp replies.",
    icon: DollarSign,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    tag: "Revenue",
  },
  {
    name: "Proposal Agent",
    desc: "Generates a full 6-slide pitch deck or service proposal ready to share with clients.",
    icon: Briefcase,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    tag: "Pitch",
  },
  {
    name: "Invoice Agent",
    desc: "Drafts professional invoices with line items, deposit amount, and payment terms.",
    icon: Receipt,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    tag: "Finance",
  },
  {
    name: "Call Agent",
    desc: "Writes step-by-step call scripts and recommends follow-up appointment slots.",
    icon: Phone,
    color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    tag: "Follow-up",
  },
  {
    name: "Admin Agent",
    desc: "Creates tasks, follow-up reminders, and calendar blocks for the owner and team.",
    icon: Calendar,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    tag: "Admin",
  },
  {
    name: "Marketing Agent",
    desc: "Drafts promos, review responses, and WhatsApp broadcast messages.",
    icon: Megaphone,
    color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    tag: "Growth",
  },
];

const DEMO_STEPS = [
  {
    num: "01",
    title: "Message Arrives",
    body: "\"Hi, I need a full branding package — logo, website, and social campaign for my café opening next month.\"",
    label: "WhatsApp Inbound",
    color: "border-slate-600 text-slate-400",
  },
  {
    num: "02",
    title: "AI Router Classifies",
    body: "Intent: service_inquiry · Urgency: high · Est. Value: SGD 4,500 · Missing: timeline, budget",
    label: "Router Agent",
    color: "border-emerald-600 text-emerald-400",
  },
  {
    num: "03",
    title: "6 Agents Work in Parallel",
    body: "Sales drafts quote · Proposal Agent builds pitch deck · Call Agent writes appointment script · Admin creates follow-up tasks",
    label: "6 Agents",
    color: "border-blue-600 text-blue-400",
  },
  {
    num: "04",
    title: "Owner Approves",
    body: "Dashboard shows quote, proposal deck, call script, and tasks. Owner taps Approve — reply and proposal sent instantly.",
    label: "Approval Queue",
    color: "border-purple-600 text-purple-400",
  },
];

const PAIN_POINTS = [
  "Customer inquiries get missed or replied hours late",
  "Quotes and proposals are typed manually every single time",
  "Leads go cold because follow-ups are forgotten",
  "Owners spend hours on admin instead of growing the business",
  "No professional proposal = lost deals to bigger competitors",
];

const VERTICALS = [
  { name: "Digital Agency", desc: "Proposals, quotes, project kick-offs", active: true },
  { name: "F&B / Catering", desc: "Event quotes, menus, order follow-up", active: true },
  { name: "Insurance", desc: "Policy inquiries, pitch decks, appointments", active: true },
  { name: "Renovation", desc: "Quote requests, site visits, milestones", active: true },
  { name: "Tuition", desc: "Class bookings, parent follow-ups, schedules", active: false },
  { name: "Salons", desc: "Appointments, packages, promos", active: false },
];

const IMPACT = [
  { icon: Clock, stat: "< 2 min", label: "First response time", sub: "Down from hours" },
  { icon: TrendingUp, stat: "80%", label: "Faster quote & proposal prep", sub: "Compared to manual" },
  { icon: CheckCircle, stat: "0", label: "Missed follow-ups", sub: "Every lead tracked" },
  { icon: Zap, stat: "6", label: "AI agents per message", sub: "Working in parallel" },
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
          <span className="text-emerald-400">for Any SME</span>
        </h1>

        <p className="text-xl text-slate-300 mb-3 max-w-2xl mx-auto leading-relaxed">
          ServeOps AI turns WhatsApp customer messages into quotes, proposals,
          invoices, call scripts, and owner-approved business actions — in seconds.
        </p>
        <p className="text-slate-500 mb-12 text-sm">
          Works for agencies, F&amp;B, insurance, renovation, tuition, salons — any SME that runs on WhatsApp.
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
            <div className="p-5 grid grid-cols-5 gap-4 text-left min-h-[200px]">
              {/* message bubble */}
              <div className="col-span-2 space-y-2">
                <div className="text-xs text-slate-500 font-medium mb-1">Inbox</div>
                <div className="bg-slate-800 rounded-lg p-2.5 border border-slate-700 border-l-2 border-l-emerald-500">
                  <div className="text-xs font-medium text-white">Amelia Tan · New Lead</div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    Hi, I need branding + website + social campaign for my café opening next month
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">HIGH</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">SGD 4,500</span>
                  </div>
                </div>
              </div>
              {/* agent cards */}
              <div className="col-span-3 space-y-1.5">
                <div className="text-xs text-slate-500 font-medium mb-1">AI Analysis — 5 actions pending</div>
                {[
                  { label: "Sales Agent", text: "Quote ready: SGD 4,500 · Branding + Web + Campaign", color: "border-blue-700 bg-blue-950/40" },
                  { label: "Proposal Agent", text: "6-slide pitch deck drafted — ready to send", color: "border-indigo-700 bg-indigo-950/40" },
                  { label: "Call Agent", text: "Call script ready · Slots: Tomorrow 10am or Fri 2pm", color: "border-teal-700 bg-teal-950/40" },
                  { label: "Invoice Agent", text: "Invoice draft: SGD 4,500 · Deposit SGD 2,250", color: "border-emerald-700 bg-emerald-950/40" },
                ].map((c) => (
                  <div key={c.label} className={`rounded-lg border p-2 text-xs flex items-center gap-2 ${c.color}`}>
                    <div className="flex-1">
                      <span className="text-slate-400">{c.label}: </span>
                      <span className="text-slate-200">{c.text}</span>
                    </div>
                    <span className="bg-emerald-700/80 text-white px-2 py-0.5 rounded text-xs font-medium flex-shrink-0">Approve</span>
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
              Whether you run a digital agency, insurance practice, catering business,
              or renovation firm — every inquiry arrives on WhatsApp and gets handled
              manually. Proposals get delayed. Follow-ups get missed. Deals are lost.
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
                { from: "Amelia Tan", msg: "Hi, need branding + website for my café launch", time: "8:02 AM", unread: true },
                { from: "Priya Nair", msg: "Can you explain term vs whole life policy?", time: "8:21 AM", unread: true },
                { from: "David Lim", msg: "Need catering for 50 pax on 20 Aug", time: "8:45 AM", unread: true },
                { from: "Jason Ong", msg: "Just got BTO keys — need full reno quote", time: "9:10 AM", unread: true },
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
              <div className="mt-3 text-center text-xs text-slate-600">+ 9 more unread</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO FLOW ── */}
      <section id="demo" className="bg-slate-900/40 border-y border-slate-800 py-20">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">The Workflow</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From WhatsApp inquiry to approved action
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              One message triggers 6 AI agents that build a quote, proposal deck, invoice,
              call script, and task list — all waiting for your approval.
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">6 AI Agents, 1 Platform</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Each agent is specialized for a distinct business function.
            They run in parallel, then surface recommendations for owner approval.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.name}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3"
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
              { n: "1", title: "Connect WhatsApp", desc: "Scan QR or connect via WhatsApp Business API. All messages land in ServeOps.", icon: MessageSquare },
              { n: "2", title: "Message Arrives", desc: "Inquiry, order, review, or question — every message is captured automatically.", icon: Bot },
              { n: "3", title: "AI Routes & Acts", desc: "Router classifies intent and urgency. 6 agents build outputs in parallel.", icon: Zap },
              { n: "4", title: "Owner Reviews", desc: "Every action — quote, proposal, invoice, script — waits for your approval.", icon: Shield },
              { n: "5", title: "Business Acts", desc: "Approve once. Reply sent, proposal shared, invoice drafted, tasks created.", icon: CheckCircle },
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
          <div className="text-lg font-semibold text-white mb-1">Every action is owner-approved.</div>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            ServeOps AI never sends a message, creates a proposal, or raises an invoice
            without explicit owner approval. You stay in full control.
          </p>
        </div>
      </section>

      {/* ── INDUSTRY FIT ── */}
      <section className="bg-slate-900/40 border-y border-slate-800 py-20">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-10">
            <div className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">Industry Fit</div>
            <h2 className="text-3xl font-bold mb-3">Works for any SME that sells on WhatsApp.</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Same platform, same 6 agents. The business context adapts — pricing, proposals,
              scripts, and follow-ups are tailored to your industry automatically.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {VERTICALS.map((v) => (
              <div
                key={v.name}
                className={`rounded-xl border p-4 transition-colors ${
                  v.active
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-900 border-slate-800 opacity-50"
                }`}
              >
                <div className={`font-semibold text-sm mb-1 flex items-center gap-1.5 ${v.active ? "text-emerald-300" : "text-slate-400"}`}>
                  {v.name}
                  {v.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />}
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
          ServeOps AI gives every SME an AI Sales, Proposal, Invoice, Call, Admin, and Marketing
          team that turns WhatsApp messages into business action.
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
