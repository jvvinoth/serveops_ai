"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Briefcase,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  Mic,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Play,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Settings,
  Sparkles,
  UserRound,
  Video,
  Wand2,
  X,
} from "lucide-react";

type Message = {
  id: string;
  body: string;
  direction: "inbound" | "outbound";
  source: string;
  timestamp: string;
};

type ApprovalItem = {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  status: string;
  createdAt: string;
};

type AgentRun = {
  id: string;
  status: "pending" | "running" | "complete" | "failed";
  routerOutput: Record<string, unknown> | null;
  approvalItems: ApprovalItem[];
  createdAt: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  company?: string | null;
};

type ConversationSummary = {
  id: string;
  customer: Customer;
  messages: Message[];
  agentRuns: AgentRun[];
};

type ConversationDetail = {
  id: string;
  status: string;
  customer: Customer;
  messages: Message[];
  agentRuns: AgentRun[];
};

type ContactScenario = {
  id: string;
  name: string;
  company: string;
  phone: string;
  avatar: string;
  segment: string;
  preview: string;
  message: string;
  expected: string[];
};

type BusinessProfile = {
  businessName: string;
  industry: string;
  offerSummary: string;
  paymentTerms: string;
  availability: string;
  tone: string;
  services: Array<{ name: string; priceSgd: number; description?: string }>;
};

type BusinessProfileForm = Omit<BusinessProfile, "services"> & {
  servicesText: string;
};

const CONTACTS: ContactScenario[] = [
  {
    id: "agency_project",
    name: "Amelia Tan",
    company: "Morning Nest Cafe",
    phone: "+6597001001",
    avatar: "AT",
    segment: "New cafe owner",
    preview: "Needs logo, launch campaign, website, proposal and deposit invoice.",
    message:
      "Hi, I am opening a cafe next month called Morning Nest. Need help with logo, Instagram launch campaign, and a simple website. Can you send pricing, a proposal deck, and a deposit invoice if the package looks okay? Happy to jump on a call this week.",
    expected: ["reply", "call_script", "proposal", "invoice", "tasks"],
  },
  {
    id: "tuition_trial",
    name: "Michelle Koh",
    company: "Parent inquiry",
    phone: "+6597001002",
    avatar: "MK",
    segment: "Tuition centre",
    preview: "Parent wants trial class, fee details, schedule and invoice.",
    message:
      "Hello, I am looking for Primary 6 Math tuition for my son. Can you arrange a trial class this weekend, share fees, and send registration details if we decide to start?",
    expected: ["reply", "call_script", "proposal", "invoice", "tasks"],
  },
  {
    id: "renovation_site_visit",
    name: "Jason Ong",
    company: "Tampines BTO",
    phone: "+6597001003",
    avatar: "JO",
    segment: "Renovation contractor",
    preview: "Homeowner needs site visit, proposal, timeline and quote.",
    message:
      "Hi, I just got keys to my 4-room BTO in Tampines. Need renovation for living room, kitchen, bedrooms and bathrooms. Can you schedule a site visit and send a proposal with package estimate?",
    expected: ["reply", "call_script", "proposal", "tasks"],
  },
  {
    id: "salon_package",
    name: "Nora Lee",
    company: "Bridal customer",
    phone: "+6597001004",
    avatar: "NL",
    segment: "Salon / spa",
    preview: "Customer asks for bridal package, appointment and deposit.",
    message:
      "Hi, I need a bridal facial and makeup package for September. Can you recommend package options, schedule a consultation, and let me know the deposit?",
    expected: ["reply", "call_script", "proposal", "invoice", "tasks"],
  },
];

const DEFAULT_BUSINESS_FORM: BusinessProfileForm = {
  businessName: "Happy Minds Tuition Centre",
  industry: "Tuition / Education",
  offerSummary: "Primary and secondary tuition with trial classes, parent updates, and registration support.",
  paymentTerms: "PayNow / bank transfer. Registration fee upfront, monthly fee before first class.",
  availability: "Saturday 10am, Sunday 2pm, or next weekday 7pm",
  tone: "warm, parent-friendly, professional",
  servicesText: [
    "Primary 6 Math Trial Class | 80 | 1 trial class with diagnostic review",
    "Primary 6 Math Monthly Package | 480 | Weekly classes, progress notes, and parent follow-up",
    "Registration Fee | 120 | Student onboarding and materials",
  ].join("\n"),
};

const DEFAULT_CUSTOM_SCENARIO = {
  name: "Priya Nair",
  company: "Custom WhatsApp lead",
  phone: "+6597001099",
  segment: "Custom scenario",
  message:
    "Hi, I need weekly Primary 6 Math tuition for my daughter. Can you share the monthly fees, arrange a trial class this weekend, and send registration invoice if we confirm?",
};

const AGENT_LABELS: Record<string, { label: string; icon: typeof Bot; color: string }> = {
  sales: { label: "Sales Agent", icon: MessageCircle, color: "text-blue-300 bg-blue-500/10 border-blue-500/20" },
  proposal: { label: "Proposal Agent", icon: Briefcase, color: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20" },
  invoice: { label: "Invoice Agent", icon: Receipt, color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
  call: { label: "Call Agent", icon: Phone, color: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20" },
  admin: { label: "Admin Agent", icon: CalendarClock, color: "text-purple-300 bg-purple-500/10 border-purple-500/20" },
  marketing: { label: "Marketing Agent", icon: Sparkles, color: "text-pink-300 bg-pink-500/10 border-pink-500/20" },
};

function timeLabel(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function getLatestRun(detail: ConversationDetail | null) {
  return detail?.agentRuns?.[0] ?? null;
}

function getContentText(content: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = content[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function itemKind(type: string) {
  if (type === "quote" || type === "reply" || type === "upsell") return "reply";
  if (type === "call_script" || type === "call" || type === "appointment") return "call";
  if (type === "proposal" || type === "pitch_deck") return "proposal";
  if (type === "invoice") return "invoice";
  if (type === "tasks") return "tasks";
  return "other";
}

function parseServices(text: string): BusinessProfile["services"] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", price = "0", description = ""] = line.split("|").map((part) => part.trim());
      return { name, priceSgd: Number(price.replace(/[^0-9.]/g, "")), description };
    })
    .filter((service) => service.name && service.priceSgd > 0);
}

function buildBusinessProfile(form: BusinessProfileForm): BusinessProfile {
  return {
    businessName: form.businessName,
    industry: form.industry,
    offerSummary: form.offerSummary,
    paymentTerms: form.paymentTerms,
    availability: form.availability,
    tone: form.tone,
    services: parseServices(form.servicesText),
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/60"
      />
    </label>
  );
}

function BusinessSetupPanel({
  form,
  setForm,
  profile,
}: {
  form: BusinessProfileForm;
  setForm: (next: BusinessProfileForm) => void;
  profile: BusinessProfile;
}) {
  function update<K extends keyof BusinessProfileForm>(key: K, value: BusinessProfileForm[K]) {
    setForm({ ...form, [key]: value });
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
            <Settings className="h-3.5 w-3.5" />
            Business setup
          </div>
          <h2 className="text-base font-bold text-white">Test any SME business</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            The WhatsApp message is interpreted against this profile and service catalog.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-right">
          <div className="text-lg font-bold text-emerald-200">{profile.services.length}</div>
          <div className="text-[10px] uppercase tracking-wide text-emerald-300/80">priced services</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Business name" value={form.businessName} onChange={(value) => update("businessName", value)} />
        <Field label="Industry" value={form.industry} onChange={(value) => update("industry", value)} />
        <Field label="Payment terms" value={form.paymentTerms} onChange={(value) => update("paymentTerms", value)} />
        <Field label="Call availability" value={form.availability} onChange={(value) => update("availability", value)} />
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Offer summary</span>
        <textarea
          value={form.offerSummary}
          onChange={(event) => update("offerSummary", event.target.value)}
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/60"
        />
      </label>

      <label className="mt-3 block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Services and pricing</span>
        <textarea
          value={form.servicesText}
          onChange={(event) => update("servicesText", event.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/60"
        />
        <span className="mt-1 block text-[11px] text-slate-600">Format: Service name | SGD price | short description</span>
      </label>
    </section>
  );
}

function CustomScenarioPanel({
  value,
  onChange,
  onUse,
}: {
  value: typeof DEFAULT_CUSTOM_SCENARIO;
  onChange: (next: typeof DEFAULT_CUSTOM_SCENARIO) => void;
  onUse: () => void;
}) {
  function update<K extends keyof typeof DEFAULT_CUSTOM_SCENARIO>(key: K, nextValue: (typeof DEFAULT_CUSTOM_SCENARIO)[K]) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
            <Wand2 className="h-3.5 w-3.5" />
            Custom scenario
          </div>
          <h2 className="text-base font-bold text-white">Send any customer message</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Use this when judges want to test a scenario outside the preset contacts.
          </p>
        </div>
        <button
          onClick={onUse}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-500"
        >
          <Plus className="h-4 w-4" />
          Use in phone
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Customer" value={value.name} onChange={(next) => update("name", next)} />
        <Field label="Context" value={value.company} onChange={(next) => update("company", next)} />
        <Field label="Phone" value={value.phone} onChange={(next) => update("phone", next)} />
      </div>
      <label className="mt-3 block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">WhatsApp message</span>
        <textarea
          value={value.message}
          onChange={(event) => update("message", event.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/60"
        />
      </label>
    </section>
  );
}

function PipelineStep({
  label,
  state,
}: {
  label: string;
  state: "done" | "running" | "waiting" | "failed";
}) {
  const classes = {
    done: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    running: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    waiting: "border-slate-700 bg-slate-900 text-slate-500",
    failed: "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${classes[state]}`}>
      {state === "running" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : state === "done" ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <div className="h-3.5 w-3.5 rounded-full border border-current opacity-40" />
      )}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function WhatsAppPhone({
  contacts,
  selected,
  onSelect,
  detail,
  draft,
  setDraft,
  sending,
  onSend,
}: {
  contacts: ContactScenario[];
  selected: ContactScenario;
  onSelect: (contact: ContactScenario) => void;
  detail: ConversationDetail | null;
  draft: string;
  setDraft: (value: string) => void;
  sending: boolean;
  onSend: () => void;
}) {
  const messages = detail?.customer.phone === selected.phone ? detail.messages : [];
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <section data-testid="wa-phone" className="mx-auto w-full max-w-[400px]">
      <div className="rounded-[3rem] border border-slate-700 bg-black p-2 shadow-2xl shadow-black/60">
        <div className="relative overflow-hidden rounded-[2.65rem] border border-slate-800 bg-[#0b141a]">
          <div className="absolute left-1/2 top-2 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />

          <div className="relative z-20 flex h-10 items-center justify-between bg-[#075e54] px-7 pt-2 text-[11px] font-semibold text-white">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-3.5 rounded-[3px] border border-white/80">
                <span className="block h-full w-2.5 rounded-[2px] bg-white" />
              </span>
              <span className="h-3 w-4 rounded-sm border-t-2 border-white/90" />
              <span className="h-3 w-4 rounded-sm border-t-2 border-white/90" />
            </div>
          </div>

          <div className="bg-[#075e54] px-4 pb-3 pt-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-white">WhatsApp</div>
                <div className="text-[11px] font-medium text-white/70">ServeOps demo number</div>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Search className="h-5 w-5" />
                <MoreVertical className="h-5 w-5" />
              </div>
            </div>

            <div className="flex rounded-full bg-[#0b4f47] p-1 text-xs font-semibold text-white/75">
              {["Chats", "Updates", "Calls"].map((tab, index) => (
                <div
                  key={tab}
                  className={`flex-1 rounded-full px-3 py-1.5 text-center ${index === 0 ? "bg-white text-[#075e54]" : ""}`}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>

          <div className="grid h-[430px] grid-rows-[132px_auto_1fr_auto] bg-[#0b141a]">
            <div className="overflow-hidden border-b border-[#1f2c33] bg-[#111b21] px-3 py-3">
              <div className="mb-3 rounded-full bg-[#202c33] px-3 py-2 text-xs text-slate-400">
                Search or start new chat
              </div>
              <div className="grid grid-cols-4 gap-2">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      onSelect(contact);
                      setDraft(contact.message);
                    }}
                    className={`min-w-0 rounded-xl px-1.5 py-2 text-center transition ${
                      contact.id === selected.id ? "bg-[#0b4f47]/70" : "hover:bg-[#202c33]"
                    }`}
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-700 text-xs font-bold text-white">
                      {contact.avatar}
                    </div>
                    <div className="mt-1 truncate text-[10px] font-semibold text-white">{contact.name.split(" ")[0]}</div>
                    <div className="truncate text-[9px] text-slate-400">{contact.segment}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-b border-[#1f2c33] bg-[#202c33] px-3 py-2">
              <div className="flex items-center gap-2.5">
                <ArrowLeft className="h-4 w-4 text-slate-300" />
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-700 text-xs font-bold text-white">
                  {selected.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{selected.name}</div>
                  <div className="truncate text-[11px] text-slate-400">{selected.company} · {selected.phone}</div>
                </div>
                <Video className="h-4 w-4 text-slate-300" />
                <Phone className="h-4 w-4 text-slate-300" />
                <MoreVertical className="h-4 w-4 text-slate-300" />
              </div>
            </div>

            <div className="overflow-y-auto bg-[#0b141a] px-3 py-4 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:22px_22px]">
              <div className="mx-auto mb-4 w-fit rounded-lg bg-[#182229] px-3 py-1 text-[10px] font-medium text-slate-400">
                Today
              </div>

              <div className="mb-3 flex justify-start">
                <div className="max-w-[86%] rounded-2xl rounded-tl-sm bg-[#202c33] px-3 py-2 text-xs leading-relaxed text-slate-200 shadow">
                  {selected.preview}
                  <div className="mt-1 text-right text-[10px] text-slate-500">profile note</div>
                </div>
              </div>

              {messages.length === 0 && (
                <div className="mb-3 rounded-xl bg-[#182229]/95 px-3 py-2 text-center text-[11px] leading-relaxed text-slate-400">
                  Type or send the prepared customer message below.
                </div>
              )}

              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow ${
                        message.direction === "outbound"
                          ? "rounded-tr-sm bg-[#005c4b] text-white"
                          : "rounded-tl-sm bg-[#202c33] text-slate-100"
                      }`}
                    >
                      {message.body}
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-300/70">
                        <span>{timeLabel(message.timestamp)}</span>
                        {message.direction === "outbound" && <CheckCheck className="h-3 w-3 text-sky-300" />}
                        {message.source === "agent" && <span>AI draft</span>}
                      </div>
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-sm bg-[#202c33] px-3 py-2 text-xs text-slate-300">
                      Sending message...
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#1f2c33] bg-[#111b21] p-3">
              <div className="mb-2 flex items-end gap-2">
                <div className="flex min-w-0 flex-1 items-end gap-2 rounded-3xl bg-[#202c33] px-3 py-2">
                  <MessageCircle className="mb-1 h-4 w-4 flex-shrink-0 text-slate-400" />
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={2}
                    className="max-h-16 min-h-[38px] flex-1 resize-none bg-transparent text-xs leading-relaxed text-white placeholder:text-slate-500 focus:outline-none"
                    placeholder="Message"
                  />
                  <Paperclip className="mb-1 h-4 w-4 flex-shrink-0 text-slate-400" />
                </div>
                <button
                  onClick={onSend}
                  disabled={sending || !draft.trim()}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition hover:bg-[#06cf9c] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send customer message"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={onSend}
                disabled={sending || !draft.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#00a884]/40 bg-[#00a884]/10 px-4 py-2 text-xs font-bold text-[#8ff5d2] transition hover:bg-[#00a884]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                Send as customer into AI operating team
              </button>
            </div>
          </div>

          <div className="h-4 bg-black" />
        </div>
      </div>
    </section>
  );
}

function RouterPanel({ run }: { run: AgentRun | null }) {
  const router = run?.routerOutput;
  const agents = asArray<string>(router?.agents);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Real-Time AI Pipeline</h2>
          <p className="text-xs text-slate-500">Message understanding → agent routing → stored deliverables</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          run?.status === "complete"
            ? "bg-emerald-500/10 text-emerald-300"
            : run?.status === "running"
            ? "bg-amber-500/10 text-amber-300"
            : run?.status === "failed"
            ? "bg-red-500/10 text-red-300"
            : "bg-slate-800 text-slate-500"
        }`}>
          {run?.status ?? "waiting"}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        <PipelineStep label="Receive" state={run ? "done" : "waiting"} />
        <PipelineStep
          label="Understand"
          state={run?.routerOutput ? "done" : run ? "running" : "waiting"}
        />
        <PipelineStep
          label="Route"
          state={agents.length ? "done" : run?.status === "running" ? "running" : "waiting"}
        />
        <PipelineStep
          label="Create"
          state={
            run?.status === "complete"
              ? "done"
              : run?.status === "failed"
              ? "failed"
              : run
              ? "running"
              : "waiting"
          }
        />
        <PipelineStep
          label="Approve"
          state={run?.approvalItems?.length ? "done" : run?.status === "complete" ? "done" : "waiting"}
        />
      </div>

      {router ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-600">Intent</div>
              <div className="mt-1 text-sm font-semibold text-white">{String(router.intent ?? "unknown")}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-600">Value</div>
              <div className="mt-1 text-sm font-semibold text-emerald-300">
                {String(router.currency ?? "SGD")} {Number(router.estimatedValue ?? 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-600">Urgency</div>
              <div className="mt-1 text-sm font-semibold text-amber-300">{String(router.urgency ?? "normal")}</div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{String(router.summary ?? "")}</p>
          {asArray<string>(router.missingInfo).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {asArray<string>(router.missingInfo).slice(0, 5).map((item) => (
                <span key={item} className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-400">
                  Missing: {item}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-6 text-center">
          <Bot className="mx-auto mb-2 h-8 w-8 text-slate-700" />
          <p className="text-sm font-medium text-slate-400">Send a WhatsApp message to start the AI team.</p>
          <p className="mt-1 text-xs text-slate-600">The pipeline will update automatically while the LLM runs.</p>
        </div>
      )}

      {agents.length > 0 && (
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {agents.map((agent) => {
            const meta = AGENT_LABELS[agent] ?? { label: agent, icon: Bot, color: "text-slate-300 bg-slate-800 border-slate-700" };
            const Icon = meta.icon;
            return (
              <div key={agent} className={`rounded-xl border px-3 py-2 ${meta.color}`}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{meta.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DeliverableCard({
  item,
  onSimulateCall,
}: {
  item: ApprovalItem;
  onSimulateCall?: (item: ApprovalItem) => void;
}) {
  const kind = itemKind(item.type);
  const content = item.content ?? {};
  const slides = asArray<{ title?: string; bullets?: string[]; slideNumber?: number }>(content.slides);
  const lineItems = asArray<{ description?: string; qty?: number; unitPrice?: number; subtotal?: number }>(content.lineItems);
  const tasks = asArray<{ title?: string; body?: string; assignee?: string; dueDate?: string }>(content.tasks);
  const callScript = content.script as
    | { opening?: string; keyPoints?: string[]; closing?: string }
    | undefined;
  const quote = content.quote as
    | { totalSgd?: number; items?: { name?: string; qty?: number; subtotalSgd?: number }[] }
    | undefined;

  const meta = {
    reply: { label: "Reply / Quote", icon: MessageCircle, color: "border-blue-500/20 bg-blue-500/10 text-blue-200" },
    call: { label: "Call + Appointment", icon: Phone, color: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200" },
    proposal: { label: "Proposal Deck", icon: Briefcase, color: "border-indigo-500/20 bg-indigo-500/10 text-indigo-200" },
    invoice: { label: "Invoice Draft", icon: Receipt, color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" },
    tasks: { label: "Tasks", icon: CalendarClock, color: "border-purple-500/20 bg-purple-500/10 text-purple-200" },
    other: { label: item.type, icon: FileText, color: "border-slate-700 bg-slate-900 text-slate-300" },
  }[kind];
  const Icon = meta.icon;

  return (
    <article className={`rounded-2xl border p-4 ${meta.color}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-current/20 bg-black/15 p-2">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide opacity-70">{meta.label}</div>
            <h3 className="mt-0.5 text-sm font-bold text-white">{String(content.title ?? item.title)}</h3>
          </div>
        </div>
        <span className="rounded-full bg-black/20 px-2 py-1 text-[11px] font-medium capitalize">
          {item.status}
        </span>
      </div>

      {kind === "reply" && (
        <div className="space-y-3">
          <p className="rounded-xl bg-black/20 p-3 text-xs leading-relaxed text-slate-100">
            {getContentText(content, ["whatsappReply", "leadSummary", "notes"]) || "Reply draft generated."}
          </p>
          {quote?.totalSgd ? (
            <div className="rounded-xl bg-black/15 p-3 text-xs">
              <div className="mb-1 font-semibold text-white">Quote total: SGD {Number(quote.totalSgd).toLocaleString()}</div>
              {asArray<{ name?: string; qty?: number; subtotalSgd?: number }>(quote.items).slice(0, 3).map((q) => (
                <div key={q.name} className="flex justify-between text-slate-300">
                  <span>{q.name}</span>
                  <span>SGD {Number(q.subtotalSgd ?? 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {kind === "call" && (
        <div className="space-y-2 text-xs text-slate-100">
          {getContentText(content, ["reason", "notes"]) && (
            <p className="rounded-xl bg-black/20 p-3 leading-relaxed">{getContentText(content, ["reason", "notes"])}</p>
          )}
          {asArray<{ label?: string; date?: string; time?: string }>(content.suggestedAppointmentSlots).slice(0, 2).map((slot) => (
            <div key={`${slot.date}-${slot.time}`} className="flex items-center justify-between rounded-lg bg-black/15 px-3 py-2">
              <span>{slot.label ?? slot.date}</span>
              <span className="font-semibold">{slot.time}</span>
            </div>
          ))}
          {callScript?.keyPoints?.length ? (
            <div className="rounded-xl bg-black/15 p-3">
              <div className="mb-1 font-semibold text-white">Call script</div>
              {callScript.keyPoints.slice(0, 3).map((point) => (
                <div key={point} className="flex gap-2 leading-relaxed text-slate-300">
                  <span className="text-cyan-300">•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          ) : null}
          <button
            onClick={() => onSimulateCall?.(item)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-950 hover:bg-slate-200"
          >
            <Phone className="h-3.5 w-3.5" />
            Simulate Call Agent
          </button>
        </div>
      )}

      {kind === "proposal" && (
        <div className="space-y-3">
          {content.pricingSummary ? (
            <div className="rounded-xl bg-black/20 p-3 text-xs">
              <div className="font-semibold text-white">
                {(content.pricingSummary as { packageName?: string }).packageName}
              </div>
              <div className="mt-1 text-slate-300">
                Total: SGD {Number((content.pricingSummary as { totalSgd?: number }).totalSgd ?? 0).toLocaleString()}
              </div>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            {slides.slice(0, 6).map((slide, index) => (
              <div key={`${slide.title}-${index}`} className="min-h-20 rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="mb-1 text-[11px] font-bold text-white">
                  {slide.slideNumber ?? index + 1}. {slide.title}
                </div>
                {asArray<string>(slide.bullets).slice(0, 2).map((bullet) => (
                  <div key={bullet} className="text-[11px] leading-relaxed text-slate-300">• {bullet}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {kind === "invoice" && (
        <div className="space-y-3 text-xs">
          <div className="rounded-xl bg-black/20 p-3">
            <div className="flex justify-between">
              <span className="text-slate-300">Invoice</span>
              <span className="font-bold text-white">{String(content.invoiceNumber ?? "Draft")}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-slate-300">Total</span>
              <span className="font-bold text-emerald-200">SGD {Number(content.totalSgd ?? 0).toLocaleString()}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-slate-300">Deposit</span>
              <span className="font-semibold">SGD {Number(content.depositDueSgd ?? 0).toLocaleString()}</span>
            </div>
          </div>
          {lineItems.slice(0, 3).map((line) => (
            <div key={line.description} className="flex justify-between rounded-lg bg-black/15 px-3 py-2">
              <span className="text-slate-200">{line.description}</span>
              <span>SGD {Number(line.subtotal ?? 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {kind === "tasks" && (
        <div className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.title} className="rounded-xl bg-black/15 px-3 py-2 text-xs">
              <div className="font-semibold text-white">{task.title}</div>
              <div className="mt-0.5 text-slate-400">
                {task.assignee ?? "Owner"}{task.dueDate ? ` · ${task.dueDate}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {(kind === "proposal" || kind === "invoice") && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <a
            href={kind === "proposal" ? `/deck/${item.id}` : `/invoice/${item.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-950 hover:bg-slate-200"
          >
            {kind === "proposal" ? "Open Pitch Deck" : "Open Invoice"}
            <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </article>
  );
}

function CallSimulationModal({
  item,
  selected,
  profile,
  onClose,
}: {
  item: ApprovalItem;
  selected: ContactScenario;
  profile: BusinessProfile;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const content = item.content ?? {};
  const callScript = content.script as { opening?: string; keyPoints?: string[]; closing?: string } | undefined;
  const slots = asArray<{ label?: string; date?: string; time?: string }>(content.suggestedAppointmentSlots);
  const chosenSlot = slots[0]?.label || `${slots[0]?.date ?? "Tomorrow"} ${slots[0]?.time ?? "14:30"}`;
  const transcript = [
    { speaker: "AI Call Agent", text: callScript?.opening || `Hi ${selected.name}, this is ${profile.businessName}. I saw your WhatsApp message and wanted to help confirm the details.` },
    { speaker: selected.name, text: "Yes, thanks for calling. I wanted to understand the package and next step." },
    { speaker: "AI Call Agent", text: `Great. I can walk you through ${profile.services[0]?.name || "the recommended package"} and confirm if ${chosenSlot} works.` },
    { speaker: selected.name, text: "That works. Please reserve the slot and send the details on WhatsApp." },
    { speaker: "AI Call Agent", text: callScript?.closing || "Perfect, I will send the proposal, invoice, and confirmation to WhatsApp for review." },
  ];

  useEffect(() => {
    setStep(0);
    const interval = setInterval(() => {
      setStep((current) => (current >= transcript.length ? current : current + 1));
    }, 900);
    return () => clearInterval(interval);
  }, [item.id, transcript.length]);

  const complete = step >= transcript.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 text-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-200">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Call Agent Simulation</h2>
              <p className="text-xs text-slate-500">{profile.businessName} calling {selected.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-700 p-2 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid gap-5 p-5 md:grid-cols-[260px_minmax(0,1fr)]">
          <div className="rounded-[2.2rem] border border-slate-700 bg-black p-3">
            <div className="rounded-[1.8rem] bg-[#101820] px-5 py-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 text-2xl font-bold">
                {selected.avatar}
              </div>
              <div className="text-xl font-bold">{selected.name}</div>
              <div className="mt-1 text-xs text-slate-400">{selected.phone}</div>
              <div className="mt-6 rounded-full bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200">
                {complete ? "Call completed" : "On call..."}
              </div>
              <div className="mt-6 flex justify-center gap-1.5">
                {[0, 1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    className={`h-12 w-2 rounded-full bg-cyan-300 ${!complete ? "animate-pulse" : "opacity-40"}`}
                    style={{ animationDelay: `${bar * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Call goal</div>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                {String(content.reason ?? "Confirm customer requirement, answer key questions, and reserve the next appointment or payment step.")}
              </p>
            </div>

            <div className="space-y-3">
              {transcript.slice(0, Math.max(1, step)).map((line, index) => (
                <div key={`${line.speaker}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className={`mb-1 text-xs font-bold ${line.speaker === "AI Call Agent" ? "text-cyan-300" : "text-emerald-300"}`}>
                    {line.speaker}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">{line.text}</p>
                </div>
              ))}
            </div>

            {complete && (
              <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Appointment outcome created
                </div>
                <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">
                  Slot reserved: {chosenSlot}. Owner should approve the generated invoice/proposal before sending final confirmation.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function DeliverablesPanel({
  run,
  onSimulateCall,
}: {
  run: AgentRun | null;
  onSimulateCall: (item: ApprovalItem) => void;
}) {
  const items = run?.approvalItems ?? [];

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Generated Business Deliverables</h2>
          <p className="text-xs text-slate-500">Each card is stored as an approval item for the owner.</p>
        </div>
        <a
          href="/app/generated-docs"
          className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white"
        >
          Open docs <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {items.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {items.map((item) => (
            <DeliverableCard key={item.id} item={item} onSimulateCall={onSimulateCall} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-slate-700" />
          <p className="text-sm font-medium text-slate-400">No deliverables yet.</p>
          <p className="mt-1 text-xs text-slate-600">Send a customer message and wait for the agents to finish.</p>
        </div>
      )}
    </section>
  );
}

export default function LiveSimulatorPage() {
  const [businessForm, setBusinessForm] = useState<BusinessProfileForm>(DEFAULT_BUSINESS_FORM);
  const [customScenario, setCustomScenario] = useState(DEFAULT_CUSTOM_SCENARIO);
  const [selected, setSelected] = useState(CONTACTS[0]);
  const [draft, setDraft] = useState(CONTACTS[0].message);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState("");
  const [callItem, setCallItem] = useState<ApprovalItem | null>(null);

  const latestRun = getLatestRun(detail);
  const businessProfile = useMemo(() => buildBusinessProfile(businessForm), [businessForm]);
  const customContact = useMemo<ContactScenario>(() => ({
    id: "custom_scenario",
    name: customScenario.name || "Custom Lead",
    company: customScenario.company || "Custom WhatsApp lead",
    phone: customScenario.phone || "+6597001099",
    avatar: (customScenario.name || "CL")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    segment: customScenario.segment || "Custom scenario",
    preview: customScenario.message.slice(0, 90),
    message: customScenario.message,
    expected: ["reply", "call_script", "proposal", "invoice", "tasks"],
  }), [customScenario]);
  const contacts = useMemo(() => [...CONTACTS, customContact], [customContact]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.customer.phone === selected.phone),
    [conversations, selected.phone]
  );

  async function loadConversations() {
    const res = await fetch("/api/messages/inbound", { cache: "no-store" });
    if (res.ok) setConversations(await res.json());
  }

  async function loadDetail(id: string) {
    const res = await fetch(`/api/conversations/${id}`, { cache: "no-store" });
    if (res.ok) setDetail(await res.json());
  }

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation?.id && !conversationId) {
      setConversationId(selectedConversation.id);
    }
  }, [selectedConversation?.id, conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setDetail(null);
      return;
    }
    loadDetail(conversationId);
    const interval = setInterval(() => loadDetail(conversationId), 2500);
    return () => clearInterval(interval);
  }, [conversationId]);

  function selectContact(contact: ContactScenario) {
    setSelected(contact);
    const existing = conversations.find((conversation) => conversation.customer.phone === contact.phone);
    setConversationId(existing?.id ?? null);
    setDetail(null);
  }

  async function sendMessage(messageOverride?: string) {
    const messageToSend = (messageOverride ?? draft).trim();
    if (!messageToSend) return;
    setSending(true);
    setNotice("");
    try {
      const res = await fetch("/api/messages/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: selected.phone,
          name: selected.name,
          message: messageToSend,
          source: "simulator",
          businessProfile,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      const data = (await res.json()) as { conversationId: string };
      setConversationId(data.conversationId);
      setNotice("Message received. ServeOps agents are generating business deliverables.");
      await loadConversations();
      setTimeout(() => loadDetail(data.conversationId), 900);
    } catch {
      setNotice("Message failed. Check API/database/LLM settings.");
    } finally {
      setSending(false);
    }
  }

  async function resetDemo() {
    if (!confirm("Reset all simulator conversations and generated agent outputs?")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/demo", { method: "DELETE" });
      if (res.ok) {
        setConversationId(null);
        setDetail(null);
        setConversations([]);
        setCallItem(null);
        setNotice("Simulator reset. Pick a contact and send a fresh message.");
      }
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1540px] px-5 py-4">
        <header className="mb-4 flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 md:flex-row md:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
              Live demo simulator
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              WhatsApp message → AI business deliverables
            </h1>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">
              Select a customer profile, send a realistic WhatsApp inquiry, then watch ServeOps route the work to agents that create a reply, call plan, proposal deck, invoice draft, and follow-up tasks.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setDraft(selected.message);
                void sendMessage(selected.message);
              }}
              disabled={sending}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run selected scenario
            </button>
            <button
              onClick={resetDemo}
              disabled={resetting}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${resetting ? "animate-spin" : ""}`} />
              Reset
            </button>
          </div>
        </header>

        {notice && (
          <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {notice}
          </div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(390px,430px)_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-5">
            <WhatsAppPhone
              contacts={contacts}
              selected={selected}
              onSelect={selectContact}
              detail={detail}
              draft={draft}
              setDraft={setDraft}
              sending={sending}
              onSend={() => sendMessage()}
            />
          </div>

          <div data-testid="agent-scroll-panel" className="space-y-5 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2">
            <BusinessSetupPanel form={businessForm} setForm={setBusinessForm} profile={businessProfile} />
            <CustomScenarioPanel
              value={customScenario}
              onChange={setCustomScenario}
              onUse={() => {
                setSelected(customContact);
                setConversationId(null);
                setDetail(null);
                setDraft(customContact.message);
                setNotice("Custom scenario loaded into the WhatsApp simulator.");
              }}
            />

            <section className="grid gap-3 md:grid-cols-4">
              {[
                { label: "Active customer", value: selected.name, sub: selected.company, icon: UserRound },
                { label: "Stored conversation", value: detail ? "Yes" : "Waiting", sub: detail?.status ?? "send message", icon: MessageCircle },
                { label: "Agents expected", value: String(selected.expected.length), sub: selected.expected.join(" · "), icon: Bot },
                { label: "Deliverables", value: String(latestRun?.approvalItems?.length ?? 0), sub: "stored approval cards", icon: FileText },
              ].map(({ label, value, sub, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{label}</span>
                    <Icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="truncate text-lg font-bold text-white">{value}</div>
                  <div className="mt-1 truncate text-xs text-slate-500">{sub}</div>
                </div>
              ))}
            </section>

            <RouterPanel run={latestRun} />
            <DeliverablesPanel run={latestRun} onSimulateCall={setCallItem} />
          </div>
        </div>
      </div>
      {callItem && (
        <CallSimulationModal
          item={callItem}
          selected={selected}
          profile={businessProfile}
          onClose={() => setCallItem(null)}
        />
      )}
    </main>
  );
}
