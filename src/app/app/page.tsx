"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  MessageCircle,
  Phone,
  Play,
  Receipt,
  RefreshCw,
  Send,
  Sparkles,
  UserRound,
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

  return (
    <section className="rounded-[2rem] border border-slate-700 bg-slate-950 p-3 shadow-2xl shadow-black/40">
      <div className="overflow-hidden rounded-[1.55rem] border border-slate-800 bg-[#0b141a]">
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#111b21] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-200 flex items-center justify-center">
              SO
            </div>
            <div>
              <div className="text-sm font-semibold text-white">ServeOps WhatsApp</div>
              <div className="text-[11px] text-emerald-300">mock business number · online</div>
            </div>
          </div>
          <MessageCircle className="h-4 w-4 text-slate-500" />
        </div>

        <div className="grid h-[650px] grid-rows-[170px_1fr_auto]">
          <div className="border-b border-slate-800 bg-[#111b21] p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Customer contacts
            </div>
            <div className="space-y-1.5">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    onSelect(contact);
                    setDraft(contact.message);
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition ${
                    contact.id === selected.id ? "bg-emerald-500/10" : "hover:bg-slate-800/60"
                  }`}
                >
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-700 text-[11px] font-bold text-white flex items-center justify-center">
                    {contact.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-white">{contact.name}</div>
                    <div className="truncate text-[11px] text-slate-500">{contact.company}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto bg-[radial-gradient(circle_at_top,#18352c_0,#0b141a_38%)] p-3">
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#111b21]/90 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-slate-700 text-[11px] font-bold text-white flex items-center justify-center">
                {selected.avatar}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{selected.name}</div>
                <div className="truncate text-[11px] text-slate-400">{selected.segment} · {selected.phone}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-[#202c33] px-3 py-2 text-xs leading-relaxed text-slate-200">
                {selected.preview}
                <div className="mt-1 text-right text-[10px] text-slate-500">profile note</div>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      message.direction === "outbound"
                        ? "rounded-tr-sm bg-[#005c4b] text-white"
                        : "rounded-tl-sm bg-[#202c33] text-slate-100"
                    }`}
                  >
                    {message.body}
                    <div className="mt-1 text-right text-[10px] text-slate-300/70">
                      {timeLabel(message.timestamp)}
                      {message.source === "simulator" ? " · customer" : ""}
                      {message.source === "agent" ? " · AI draft" : ""}
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

          <div className="border-t border-slate-800 bg-[#111b21] p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
              className="mb-2 w-full resize-none rounded-xl border border-slate-700 bg-[#202c33] px-3 py-2 text-xs leading-relaxed text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none"
              placeholder="Send as customer..."
            />
            <button
              onClick={onSend}
              disabled={sending || !draft.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Customer Message
            </button>
          </div>
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

function DeliverableCard({ item }: { item: ApprovalItem }) {
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
    </article>
  );
}

function DeliverablesPanel({ run }: { run: AgentRun | null }) {
  const items = run?.approvalItems ?? [];

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Generated Business Deliverables</h2>
          <p className="text-xs text-slate-500">Each card is stored as an approval item for the owner.</p>
        </div>
        <a
          href="/app/approvals"
          className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white"
        >
          Open approvals <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {items.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {items.map((item) => (
            <DeliverableCard key={item.id} item={item} />
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
  const [contacts] = useState(CONTACTS);
  const [selected, setSelected] = useState(CONTACTS[0]);
  const [draft, setDraft] = useState(CONTACTS[0].message);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState("");

  const latestRun = getLatestRun(detail);

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
        setNotice("Simulator reset. Pick a contact and send a fresh message.");
      }
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1540px] px-5 py-5">
        <header className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
              Live demo simulator
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              WhatsApp message → AI business deliverables
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">
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

        <div className="grid gap-5 lg:grid-cols-[430px_minmax(0,1fr)]">
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

          <div className="space-y-5">
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
            <DeliverablesPanel run={latestRun} />
          </div>
        </div>
      </div>
    </main>
  );
}
