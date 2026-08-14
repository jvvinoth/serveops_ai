import Link from "next/link";
import { Bot, ArrowRight, ArrowDown, Database, Cloud, Smartphone, Globe, Shield, Zap } from "lucide-react";

export const metadata = {
  title: "Architecture — ServeOps AI",
  description: "Technical architecture of the ServeOps AI multi-agent pipeline.",
};

const STACK = [
  { layer: "Frontend", tech: "Next.js 15 App Router + TypeScript", detail: "React Server Components, Tailwind CSS v4, shadcn/ui", color: "text-blue-400 border-blue-500/30 bg-blue-500/5" },
  { layer: "AI Pipeline", tech: "6-Agent Orchestration (custom)", detail: "Router → Sales + Proposal + Invoice + Admin + Marketing + Call — parallel execution via Promise.all", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" },
  { layer: "LLM", tech: "OpenRouter API", detail: "Abstracted LLM gateway — switch between Claude, GPT-4o, Mistral without code changes", color: "text-purple-400 border-purple-500/30 bg-purple-500/5" },
  { layer: "Database", tech: "Neon Postgres (serverless)", detail: "Prisma v7 ORM + PrismaPg driver adapter · 14 models covering all business data", color: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
  { layer: "WhatsApp", tech: "Meta WhatsApp Business Cloud API", detail: "Official Meta Cloud API with webhook verification, message templates, and business account management", color: "text-green-400 border-green-500/30 bg-green-500/5" },
  { layer: "Deployment", tech: "Railway", detail: "Container-based deployment with env var injection. Zero cold-start with Neon pooler.", color: "text-pink-400 border-pink-500/30 bg-pink-500/5" },
];

const AGENTS_DETAIL = [
  {
    name: "Router Agent",
    role: "Classifier",
    prompt: "Classifies intent, urgency (low/medium/high), estimated value, customer type, and missing info. Returns JSON with agent routing list.",
    output: "routerOutput JSON → conversation record",
    color: "border-slate-600 text-slate-300",
  },
  {
    name: "Sales Agent",
    role: "Revenue",
    prompt: "Reads business context, customer history, and pricing. Drafts quotes with line-items and totals. Prepares a WhatsApp reply draft.",
    output: "ApprovalItem: type=quote, type=reply",
    color: "border-blue-600 text-blue-300",
  },
  {
    name: "Proposal Agent",
    role: "Proposals",
    prompt: "Generates structured 6-slide pitch decks with executive summary, problem/solution, pricing tiers, and next steps tailored to the prospect.",
    output: "ApprovalItem: type=proposal",
    color: "border-cyan-600 text-cyan-300",
  },
  {
    name: "Invoice Agent",
    role: "Billing",
    prompt: "Creates itemised invoices with line items, subtotal, tax, deposit amount, balance due, and configurable payment terms.",
    output: "ApprovalItem: type=invoice",
    color: "border-orange-600 text-orange-300",
  },
  {
    name: "Admin Agent",
    role: "Admin",
    prompt: "Creates prep task lists, staff reminders, and calendar items. Assigns deadlines and owners based on conversation context.",
    output: "ApprovalItem: type=tasks → Task records on approval",
    color: "border-purple-600 text-purple-300",
  },
  {
    name: "Marketing Agent",
    role: "Growth",
    prompt: "Drafts upsell messages, review responses, and promo copy relevant to the conversation context and business type.",
    output: "ApprovalItem: type=promo",
    color: "border-pink-600 text-pink-300",
  },
  {
    name: "Call Agent",
    role: "Follow-up",
    prompt: "Determines if a call-back adds value. Generates numbered call script with opening, key questions, and closing. Suggests appointment slots.",
    output: "ApprovalItem: type=call_script",
    color: "border-green-600 text-green-300",
  },
];

const SCHEMA_MODELS = [
  { name: "Business", desc: "Core tenant entity" },
  { name: "Conversation", desc: "WhatsApp thread per customer" },
  { name: "Message", desc: "Inbound/outbound messages" },
  { name: "AgentRun", desc: "Pipeline execution per message" },
  { name: "ApprovalItem", desc: "Pending actions awaiting approval" },
  { name: "Task", desc: "Generated todo items" },
  { name: "Proposal", desc: "Pitch deck drafts" },
  { name: "Invoice", desc: "Itemised invoice records" },
  { name: "Customer", desc: "Customer profiles + history" },
  { name: "Quote", desc: "Approved quote records" },
  { name: "Booking", desc: "Confirmed orders/events" },
  { name: "Product", desc: "Product/service catalog" },
  { name: "Staff", desc: "Staff directory" },
  { name: "AuditLog", desc: "Full action trail" },
];

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-bold text-white">ServeOps AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Home</Link>
          <Link href="/app" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
            Live Demo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-16 space-y-20">
        {/* Header */}
        <div>
          <div className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">Technical Architecture</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How ServeOps AI Works</h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            A multi-agent AI pipeline built on Next.js, Neon Postgres, OpenRouter,
            and the official Meta WhatsApp Business Cloud API — all owner-gated via an approval queue.
          </p>
        </div>

        {/* Top-level flow diagram */}
        <section>
          <h2 className="text-xl font-bold mb-6">End-to-End Flow</h2>
          <div className="flex flex-col md:flex-row items-center gap-2 flex-wrap">
            {[
              { label: "WhatsApp", sub: "Customer message", icon: Smartphone, color: "bg-green-500/10 border-green-500/30 text-green-300" },
              { label: "Meta Business API", sub: "Webhook / Cloud API", icon: Globe, color: "bg-slate-800 border-slate-600 text-slate-300" },
              { label: "Next.js API", sub: "/api/messages/inbound", icon: Zap, color: "bg-blue-500/10 border-blue-500/30 text-blue-300" },
              { label: "Router Agent", sub: "Classify & route", icon: Bot, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" },
              { label: "6 AI Agents", sub: "Parallel execution", icon: Bot, color: "bg-purple-500/10 border-purple-500/30 text-purple-300" },
              { label: "Approval Queue", sub: "Owner reviews", icon: Shield, color: "bg-amber-500/10 border-amber-500/30 text-amber-300" },
              { label: "Business Action", sub: "Send / Store / Alert", icon: Cloud, color: "bg-pink-500/10 border-pink-500/30 text-pink-300" },
            ].map((node, i, arr) => {
              const Icon = node.icon;
              return (
                <div key={node.label} className="flex flex-col md:flex-row items-center gap-2">
                  <div className={`border rounded-xl px-4 py-3 text-center min-w-[130px] ${node.color}`}>
                    <Icon className="w-5 h-5 mx-auto mb-1 opacity-80" />
                    <div className="font-semibold text-sm">{node.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{node.sub}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block flex-shrink-0" />
                  )}
                  {i < arr.length - 1 && (
                    <ArrowDown className="w-4 h-4 text-slate-600 md:hidden flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Stack */}
        <section>
          <h2 className="text-xl font-bold mb-6">Tech Stack</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {STACK.map((s) => (
              <div key={s.layer} className={`border rounded-xl p-5 ${s.color}`}>
                <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{s.layer}</div>
                <div className="font-semibold text-white mb-1">{s.tech}</div>
                <div className="text-sm opacity-70">{s.detail}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Agent pipeline */}
        <section>
          <h2 className="text-xl font-bold mb-2">AI Agent Pipeline</h2>
          <p className="text-slate-400 text-sm mb-6">
            Each inbound message triggers an AgentRun. The Router agent runs first,
            then all specialist agents execute in parallel via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">Promise.all()</code>.
            Results are stored as ApprovalItems pending owner action.
          </p>
          <div className="space-y-3">
            {AGENTS_DETAIL.map((a) => (
              <div key={a.name} className={`border rounded-xl p-4 grid md:grid-cols-3 gap-4 ${a.color} bg-slate-900/60`}>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">{a.role}</div>
                  <div className="font-semibold text-white">{a.name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-1">Prompt Strategy</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{a.prompt}</p>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-1">Outputs</div>
                  <p className="text-xs opacity-80 leading-relaxed">{a.output}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Schema */}
        <section>
          <h2 className="text-xl font-bold mb-2">Data Schema — 14 Models</h2>
          <p className="text-slate-400 text-sm mb-6">
            Prisma v7 + Neon Postgres (serverless). All agent outputs and business data
            persisted with full audit trail.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SCHEMA_MODELS.map((m) => (
              <div key={m.name} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">{m.name}</span>
                </div>
                <p className="text-xs text-slate-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Approval gate */}
        <section>
          <h2 className="text-xl font-bold mb-2">Owner Approval Gate</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-amber-400" />
                <span className="font-semibold text-white">What requires approval</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                {[
                  "Every WhatsApp reply before it's sent",
                  "All generated quotes before delivery",
                  "Proposal decks before sending to prospects",
                  "Invoices before issuing to customers",
                  "Task creation on behalf of staff",
                  "Marketing promos and broadcasts",
                  "Phone call recommendations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-white">What happens on approval</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                {[
                  "Reply type → WhatsApp message sent via Meta API",
                  "Quote type → Quote record created + sent",
                  "Proposal type → Deck saved and ready to share",
                  "Invoice type → Invoice record created + sent",
                  "Tasks type → Task records written to DB",
                  "Call type → Call script marked ready",
                  "Promo type → Broadcast draft saved",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Prototype vs Production */}
        <section>
          <h2 className="text-xl font-bold mb-4">Prototype vs Production</h2>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-500 text-xs">
                  <th className="text-left px-5 py-3 font-medium">Capability</th>
                  <th className="text-left px-5 py-3 font-medium">Prototype (Demo)</th>
                  <th className="text-left px-5 py-3 font-medium">Production Path</th>
                </tr>
              </thead>
              <tbody className="bg-slate-950">
                {[
                  ["WhatsApp connector", "Meta WhatsApp Business Cloud API (sandbox)", "Meta WhatsApp Business Cloud API (verified number)"],
                  ["LLM", "OpenRouter (Claude/Mistral)", "OpenRouter multi-model with fallback"],
                  ["DB", "Neon Postgres (serverless)", "Neon + read replica + connection pooling"],
                  ["Auth", "Single-tenant, no auth", "Clerk or NextAuth multi-tenant"],
                  ["Deployment", "Railway", "Railway / Cloud Run / Vercel"],
                  ["Multi-business", "Single demo tenant", "Per-business isolation, row-level security"],
                ].map(([cap, proto, prod], i, arr) => (
                  <tr key={cap} className={i < arr.length - 1 ? "border-b border-slate-800/60" : ""}>
                    <td className="px-5 py-3 font-medium text-white">{cap}</td>
                    <td className="px-5 py-3 text-slate-400">{proto}</td>
                    <td className="px-5 py-3 text-emerald-400">{prod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center border-t border-slate-800 pt-12">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors"
          >
            Try the Live Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
