"use client";
import { useEffect, useState, useRef } from "react";
import {
  MessageSquare, Bot, CheckCircle, XCircle, Loader,
  ChevronDown, ChevronUp, Phone, FileText, Briefcase,
  TrendingUp, Wrench, ClipboardList, MessageCircle, AlertTriangle,
  Receipt, Calendar,
} from "lucide-react";

interface Message {
  id: string;
  body: string;
  direction: "inbound" | "outbound";
  source: string;
  timestamp: string;
}
interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  content: unknown;
  status: string;
}
interface Recommendation {
  id: string;
  agentType: string;
  type: string;
  title: string;
  priority: string;
}
interface AgentRun {
  id: string;
  status: string;
  routerOutput: unknown;
  recommendations: Recommendation[];
  approvalItems: ApprovalItem[];
  createdAt: string;
}
interface Customer {
  id: string;
  name: string;
  phone: string;
}
interface ConversationDetail {
  id: string;
  status: string;
  customer: Customer;
  messages: Message[];
  agentRuns: AgentRun[];
}
interface ConversationSummary {
  id: string;
  customer: Customer;
  messages: Message[];
  agentRuns: { status: string; approvalItems: ApprovalItem[] }[];
}

// ─── Agent metadata ──────────────────────────────────────────────────────────
const AGENT_META: Record<string, { name: string; role: string; colorClass: string; dot: string }> = {
  sales: {
    name: "Sales Agent",
    role: "Qualifies leads, drafts quotes and WhatsApp replies",
    colorClass: "text-blue-400 bg-blue-900/30 border-blue-800",
    dot: "bg-blue-400",
  },
  proposal: {
    name: "Proposal Agent",
    role: "Creates service proposals and pitch decks to share with clients",
    colorClass: "text-indigo-400 bg-indigo-900/30 border-indigo-800",
    dot: "bg-indigo-400",
  },
  invoice: {
    name: "Invoice Agent",
    role: "Generates professional invoice drafts for confirmed deals",
    colorClass: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
    dot: "bg-emerald-400",
  },
  call: {
    name: "Call Agent",
    role: "Writes call scripts and schedules follow-up appointments",
    colorClass: "text-teal-400 bg-teal-900/30 border-teal-800",
    dot: "bg-teal-400",
  },
  admin: {
    name: "Admin Agent",
    role: "Creates follow-up tasks and calendar blocks",
    colorClass: "text-purple-400 bg-purple-900/30 border-purple-800",
    dot: "bg-purple-400",
  },
  marketing: {
    name: "Marketing Agent",
    role: "Drafts promo content, review replies, and broadcast messages",
    colorClass: "text-pink-400 bg-pink-900/30 border-pink-800",
    dot: "bg-pink-400",
  },
};

// ─── Approval type metadata ───────────────────────────────────────────────────
const TYPE_META: Record<string, {
  label: string;
  explain: string;
  agent: string;
  colorClass: string;
  icon: React.ReactNode;
}> = {
  reply: {
    label: "WhatsApp Reply",
    explain: "Sales Agent wrote a reply message to send back to the customer.",
    agent: "Sales",
    colorClass: "text-green-400 bg-green-900/30 border-green-800",
    icon: <MessageCircle className="w-3 h-3" />,
  },
  quote: {
    label: "Price Quote",
    explain: "Sales Agent built a detailed pricing quote ready to share with the customer.",
    agent: "Sales",
    colorClass: "text-blue-400 bg-blue-900/30 border-blue-800",
    icon: <FileText className="w-3 h-3" />,
  },
  proposal: {
    label: "Service Proposal",
    explain: "Proposal Agent created a full pitch deck to share with the client.",
    agent: "Proposal",
    colorClass: "text-indigo-400 bg-indigo-900/30 border-indigo-800",
    icon: <Briefcase className="w-3 h-3" />,
  },
  invoice: {
    label: "Invoice Draft",
    explain: "Invoice Agent prepared a draft invoice with full line items and payment terms.",
    agent: "Invoice",
    colorClass: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
    icon: <Receipt className="w-3 h-3" />,
  },
  call_script: {
    label: "Call Script",
    explain: "Call Agent prepared a step-by-step phone script and suggested appointment slots.",
    agent: "Call",
    colorClass: "text-teal-400 bg-teal-900/30 border-teal-800",
    icon: <Phone className="w-3 h-3" />,
  },
  appointment: {
    label: "Appointment",
    explain: "Call Agent recommended scheduling a meeting or consultation.",
    agent: "Call",
    colorClass: "text-cyan-400 bg-cyan-900/30 border-cyan-800",
    icon: <Calendar className="w-3 h-3" />,
  },
  tasks: {
    label: "Follow-up Tasks",
    explain: "Admin Agent created action items for your team to follow up on.",
    agent: "Admin",
    colorClass: "text-purple-400 bg-purple-900/30 border-purple-800",
    icon: <ClipboardList className="w-3 h-3" />,
  },
  follow_up: {
    label: "Follow-up",
    explain: "Admin Agent created a follow-up reminder to keep this deal moving.",
    agent: "Admin",
    colorClass: "text-violet-400 bg-violet-900/30 border-violet-800",
    icon: <ClipboardList className="w-3 h-3" />,
  },
  risk: {
    label: "Risk Flag",
    explain: "An agent flagged something that needs your attention.",
    agent: "",
    colorClass: "text-red-400 bg-red-900/30 border-red-800",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

function timeAgo(date: string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

type QuoteItem = { name: string; qty: number; unitPrice: number; total: number };
type CallScriptStep = { step: string; script: string };
type ProposalSlide = { slideNumber: number; title: string; content: string; bullets?: string[] };
type InvoiceLineItem = { description: string; qty: number; unitPrice: number; subtotal: number };
type AppointmentSlot = { date: string; time: string; label: string };

function QuotePreview({ content }: { content: Record<string, unknown> }) {
  const items = content.items as QuoteItem[] | undefined;
  const total = content.total as number | undefined;
  if (!items?.length) return null;
  return (
    <div className="mt-2 bg-slate-950/60 rounded-lg border border-slate-700/50 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-700/50 text-slate-500">
            <th className="text-left px-3 py-1.5 font-medium">Item</th>
            <th className="text-right px-3 py-1.5 font-medium">Qty</th>
            <th className="text-right px-3 py-1.5 font-medium">Price</th>
            <th className="text-right px-3 py-1.5 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className={i < items.length - 1 ? "border-b border-slate-800/40" : ""}>
              <td className="px-3 py-1.5 text-slate-200">{it.name}</td>
              <td className="px-3 py-1.5 text-right text-slate-400">{it.qty}</td>
              <td className="px-3 py-1.5 text-right text-slate-400">${it.unitPrice?.toFixed(2)}</td>
              <td className="px-3 py-1.5 text-right text-green-400 font-medium">${it.total?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        {!!total && (
          <tfoot>
            <tr className="border-t border-slate-700/50">
              <td colSpan={3} className="px-3 py-1.5 text-slate-400 font-medium">Total</td>
              <td className="px-3 py-1.5 text-right text-green-300 font-bold">SGD {total.toFixed(2)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function CallScriptPreview({ content }: { content: Record<string, unknown> }) {
  const script = content.script as Record<string, unknown> | undefined;
  const opening = content.opening as string | undefined ?? (script?.opening as string | undefined);
  const keyPoints = (content.keyPoints ?? script?.keyPoints) as string[] | undefined;
  const closing = content.closing as string | undefined ?? (script?.closing as string | undefined);
  const slots = content.suggestedAppointmentSlots as AppointmentSlot[] | undefined;
  return (
    <div className="mt-2 space-y-1.5">
      {!!opening && (
        <div className="text-xs text-slate-400 bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-700/50">
          <span className="text-slate-500 font-medium">Opening: </span>{opening}
        </div>
      )}
      {keyPoints?.map((point, i) => (
        <div key={i} className="bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-700/50">
          <div className="text-xs font-semibold text-teal-400 mb-0.5">{i + 1}.</div>
          <div className="text-xs text-slate-300 leading-relaxed">{point}</div>
        </div>
      ))}
      {!!closing && (
        <div className="text-xs text-slate-400 bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-700/50">
          <span className="text-slate-500 font-medium">Closing: </span>{closing}
        </div>
      )}
      {!!slots?.length && (
        <div className="mt-1">
          <div className="text-xs text-slate-500 font-medium mb-1">Suggested Slots</div>
          <div className="flex gap-2 flex-wrap">
            {slots.map((slot, i) => (
              <span key={i} className="text-xs bg-cyan-900/30 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full">
                {slot.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProposalPreview({ content }: { content: Record<string, unknown> }) {
  const slides = content.slides as ProposalSlide[] | undefined;
  const pricing = content.pricingSummary as Record<string, unknown> | undefined;
  if (!slides?.length) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {slides.map((slide) => (
          <div key={slide.slideNumber} className="bg-slate-950/60 rounded-lg px-3 py-2 border border-indigo-900/50">
            <div className="text-xs font-semibold text-indigo-400 mb-1">
              {slide.slideNumber}. {slide.title}
            </div>
            {slide.bullets?.slice(0, 3).map((b, i) => (
              <div key={i} className="text-xs text-slate-400 flex gap-1.5">
                <span className="text-indigo-500 flex-shrink-0">·</span>
                <span className="leading-relaxed">{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {pricing && (
        <div className="flex items-center justify-between bg-indigo-900/20 border border-indigo-800/50 rounded-lg px-3 py-2">
          <div>
            <div className="text-xs font-semibold text-white">{String(pricing.packageName ?? "Package")}</div>
            <div className="text-xs text-slate-400">{String(pricing.paymentTerms ?? "")}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-indigo-300">SGD {Number(pricing.totalSgd ?? 0).toFixed(0)}</div>
            <div className="text-xs text-slate-500">Deposit: SGD {Number(pricing.depositSgd ?? 0).toFixed(0)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoicePreview({ content }: { content: Record<string, unknown> }) {
  const lineItems = content.lineItems as InvoiceLineItem[] | undefined;
  const billTo = content.billTo as Record<string, unknown> | undefined;
  if (!lineItems?.length) return null;
  return (
    <div className="mt-2">
      {billTo && (
        <div className="text-xs text-slate-400 mb-2">
          Bill to: <span className="text-white font-medium">{String(billTo.name ?? "")}</span>
          {billTo.businessName ? ` · ${String(billTo.businessName)}` : ""}
        </div>
      )}
      <div className="bg-slate-950/60 rounded-lg border border-emerald-900/50 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-500">
              <th className="text-left px-3 py-1.5 font-medium">Description</th>
              <th className="text-right px-3 py-1.5 font-medium">Qty</th>
              <th className="text-right px-3 py-1.5 font-medium">Unit</th>
              <th className="text-right px-3 py-1.5 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, i) => (
              <tr key={i} className={i < lineItems.length - 1 ? "border-b border-slate-800/40" : ""}>
                <td className="px-3 py-1.5 text-slate-200">{item.description}</td>
                <td className="px-3 py-1.5 text-right text-slate-400">{item.qty}</td>
                <td className="px-3 py-1.5 text-right text-slate-400">${Number(item.unitPrice).toFixed(0)}</td>
                <td className="px-3 py-1.5 text-right text-emerald-400 font-medium">${Number(item.subtotal).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-700/50 bg-emerald-900/10">
              <td colSpan={3} className="px-3 py-1.5 text-slate-400 font-medium">Total</td>
              <td className="px-3 py-1.5 text-right text-emerald-300 font-bold">
                SGD {Number(content.totalSgd ?? 0).toFixed(0)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-3 py-1 text-slate-500 text-xs">Deposit due</td>
              <td className="px-3 py-1 text-right text-slate-300 text-xs font-medium">
                SGD {Number(content.depositDueSgd ?? 0).toFixed(0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {content.paymentInstructions && (
        <div className="text-xs text-slate-500 mt-1.5 px-1">{String(content.paymentInstructions)}</div>
      )}
    </div>
  );
}

function ApprovalCard({
  item,
  onApprove,
  onReject,
}: {
  item: ApprovalItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[item.type] ?? {
    label: item.type,
    explain: "",
    agent: "",
    colorClass: "text-slate-300 bg-slate-800 border-slate-700",
    icon: null,
  };
  const content = item.content as Record<string, unknown> | null;
  const preview =
    content?.whatsappReply ||
    content?.summary ||
    content?.notes ||
    content?.action ||
    content?.recommendation;

  const hasDetails =
    (item.type === "quote" && !!(content?.items as unknown[])?.length) ||
    (item.type === "proposal" && !!(content?.slides as unknown[])?.length) ||
    (item.type === "invoice" && !!(content?.lineItems as unknown[])?.length) ||
    (item.type === "call_script" && !!(content?.keyPoints as unknown[])?.length) ||
    (item.type === "reply" && !!content?.whatsappReply) ||
    (item.type === "tasks" && !!(content?.tasks as unknown[])?.length) ||
    (item.type === "follow_up" && !!(content?.tasks as unknown[])?.length);

  return (
    <div className={`rounded-xl border ${meta.colorClass} overflow-hidden`}>
      <div className="p-3.5">
        {/* Type label + agent badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex items-center gap-1 text-xs font-semibold opacity-90">
            {meta.icon}
            {meta.label}
          </span>
          {meta.agent && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400">
              {meta.agent} Agent
            </span>
          )}
        </div>

        {/* What the agent decided */}
        <div className="text-sm font-semibold text-white mb-1">{item.title}</div>

        {/* Plain-English explanation */}
        {meta.explain && (
          <p className="text-xs text-slate-400 leading-relaxed mb-2">{meta.explain}</p>
        )}

        {/* Preview content */}
        {!!preview && !expanded && (
          <div className="text-xs bg-slate-950/50 rounded-lg px-3 py-2 border border-slate-700/40 text-slate-300 line-clamp-2 mb-2">
            {String(preview)}
          </div>
        )}

        {/* Expanded content */}
        {expanded && content && (
          <div className="mb-2">
            {item.type === "quote" && <QuotePreview content={content} />}
            {item.type === "proposal" && <ProposalPreview content={content} />}
            {item.type === "invoice" && <InvoicePreview content={content} />}
            {item.type === "call_script" && <CallScriptPreview content={content} />}
            {item.type === "reply" && !!content.whatsappReply && (
              <div className="mt-2 bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-700/50 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {String(content.whatsappReply)}
              </div>
            )}
            {(item.type === "tasks" || item.type === "follow_up") && !!(content.tasks as unknown[])?.length && (
              <div className="mt-2 space-y-1">
                {(content.tasks as Record<string, unknown>[]).map((t, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 rounded px-2.5 py-1.5">
                    <span className="text-purple-400 font-bold">{i + 1}.</span>
                    <span>{typeof t === "string" ? t : String(t.title ?? t.body ?? JSON.stringify(t))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center justify-between gap-2 mt-1">
          {hasDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? "Hide" : "Preview content"}
            </button>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            {item.status === "pending" && (
              <>
                <button
                  onClick={() => onApprove(item.id)}
                  className="flex items-center gap-1 text-xs bg-green-700 hover:bg-green-600 text-white px-2.5 py-1 rounded-md transition-colors font-medium"
                >
                  <CheckCircle className="w-3 h-3" /> Approve & Send
                </button>
                <button
                  onClick={() => onReject(item.id)}
                  className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-red-700 text-white px-2.5 py-1 rounded-md transition-colors"
                >
                  <XCircle className="w-3 h-3" /> Skip
                </button>
              </>
            )}
            {item.status !== "pending" && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  item.status === "approved"
                    ? "bg-green-900/60 text-green-400"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {item.status === "approved" ? "✓ Sent" : "✗ Skipped"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentRunCard({
  run,
  onApprove,
  onReject,
}: {
  run: AgentRun;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const router = run.routerOutput as Record<string, unknown> | null;

  // Group recommendations by agent
  const byAgent: Record<string, Recommendation[]> = {};
  for (const rec of run.recommendations ?? []) {
    const key = rec.agentType || "other";
    byAgent[key] = [...(byAgent[key] ?? []), rec];
  }

  const priorityColor = (p: string) =>
    p === "high" ? "text-red-400" : p === "medium" ? "text-amber-400" : "text-slate-400";

  const statusLabel = run.status === "complete"
    ? "Analysis complete"
    : run.status === "running"
    ? "Agents working..."
    : run.status;

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-700">
        <Bot className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs font-semibold text-white">AI Agent Analysis</span>
        <span
          className={`ml-auto text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
            run.status === "complete"
              ? "bg-green-900/50 text-green-400"
              : run.status === "running"
              ? "bg-amber-900/50 text-amber-400"
              : "bg-red-900/50 text-red-400"
          }`}
        >
          {run.status === "running" && <Loader className="w-2.5 h-2.5 animate-spin" />}
          {statusLabel}
        </span>
      </div>

      {/* What the router understood */}
      {router && (
        <div className="bg-slate-900/70 px-4 py-3 border-b border-slate-700/60">
          {!!router.summary && (
            <p className="text-sm text-slate-200 leading-relaxed mb-2">{String(router.summary)}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs">
            {!!router.intent && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-slate-500" />
                <span className="text-slate-400">Intent:</span>
                <span className="text-white capitalize">{String(router.intent).replace(/_/g, " ")}</span>
              </div>
            )}
            {!!router.urgency && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Urgency:</span>
                <span className={`font-medium capitalize ${
                  router.urgency === "high" ? "text-red-400" :
                  router.urgency === "medium" ? "text-amber-400" : "text-green-400"
                }`}>{String(router.urgency)}</span>
              </div>
            )}
            {(router.estimatedValue as number) > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Est. Value:</span>
                <span className="text-green-400 font-semibold">
                  {String(router.currency ?? "SGD")} {(router.estimatedValue as number).toFixed(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Per-agent findings */}
      {Object.keys(byAgent).length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-slate-700/60 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Wrench className="w-3 h-3" /> What each agent found
          </div>
          {Object.entries(byAgent).map(([agentKey, recs]) => {
            const meta = AGENT_META[agentKey] ?? {
              name: agentKey,
              role: "",
              colorClass: "text-slate-300 bg-slate-800 border-slate-700",
              dot: "bg-slate-400",
            };
            return (
              <div key={agentKey} className={`rounded-lg border px-3 py-2.5 ${meta.colorClass}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                  <span className="text-xs font-semibold">{meta.name}</span>
                  <span className="text-xs opacity-50 truncate">— {meta.role}</span>
                </div>
                <div className="space-y-1">
                  {recs.map((rec) => (
                    <div key={rec.id} className="flex items-start gap-2 text-xs">
                      <span className={`font-medium flex-shrink-0 ${priorityColor(rec.priority)}`}>
                        {rec.priority === "high" ? "⚠" : rec.priority === "medium" ? "→" : "·"}
                      </span>
                      <span className="text-slate-200 leading-relaxed">{rec.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approval items — actions needing your sign-off */}
      {run.approvalItems.length > 0 ? (
        <div className="p-3 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1 flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" /> Actions waiting for your approval
          </div>
          {run.approvalItems.map((item) => (
            <ApprovalCard
              key={item.id}
              item={item}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      ) : run.status === "running" ? (
        <div className="p-4 text-center text-sm text-slate-400">
          <Loader className="w-4 h-4 animate-spin mx-auto mb-2 text-amber-400" />
          Agents are analyzing the message...
        </div>
      ) : null}
    </div>
  );
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/messages/inbound");
      if (res.ok) setConversations(await res.json());
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) setDetail(await res.json());
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadDetail(selectedId);
    const interval = setInterval(() => loadDetail(selectedId), 5000);
    return () => clearInterval(interval);
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages?.length]);

  const handleApprove = async (itemId: string) => {
    await fetch(`/api/approvals/${itemId}/approve`, {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    if (selectedId) loadDetail(selectedId);
    loadConversations();
  };

  const handleReject = async (itemId: string) => {
    await fetch(`/api/approvals/${itemId}/reject`, {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    if (selectedId) loadDetail(selectedId);
  };

  const pendingCount = (conv: ConversationSummary) =>
    conv.agentRuns?.flatMap((r) => r.approvalItems?.filter((i) => i.status === "pending") ?? [])
      .length ?? 0;

  return (
    <div className="flex h-screen">
      {/* Left: Conversation List */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">Inbox</h2>
          <p className="text-xs text-slate-500 mt-0.5">{conversations.length} conversations</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-3 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs leading-relaxed">
              No conversations yet.
              <br />
              Trigger a demo scenario from Command Center.
            </div>
          ) : (
            conversations.map((conv) => {
              const lastMsg = conv.messages?.[0];
              const pending = pendingCount(conv);
              const isRunning = conv.agentRuns?.[0]?.status === "running";
              const isActive = selectedId === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-800/70 transition-colors ${
                    isActive ? "bg-slate-800 border-l-2 border-l-green-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 mt-0.5">
                      {conv.customer?.name?.[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm text-white truncate">
                          {conv.customer?.name}
                        </span>
                        {isRunning && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {lastMsg?.body || "No messages"}
                      </div>
                      {lastMsg && (
                        <div className="text-xs text-slate-600 mt-1">{timeAgo(lastMsg.timestamp)}</div>
                      )}
                    </div>
                    {pending > 0 && (
                      <span className="flex-shrink-0 bg-amber-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {pending}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Detail */}
      {!selectedId ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-600">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a conversation</p>
          </div>
        </div>
      ) : loadingDetail && !detail ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : detail ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white">
              {detail.customer.name[0]}
            </div>
            <div>
              <div className="font-semibold text-white">{detail.customer.name}</div>
              <div className="text-xs text-slate-400">{detail.customer.phone}</div>
            </div>
            <div className="ml-auto">
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  detail.status === "open"
                    ? "border-green-700 text-green-400 bg-green-900/20"
                    : "border-slate-700 text-slate-400"
                }`}
              >
                {detail.status}
              </span>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Messages */}
            <div className="p-4 space-y-3">
              {detail.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm ${
                      msg.direction === "outbound"
                        ? "bg-green-700 text-white rounded-br-md"
                        : "bg-slate-700 text-white rounded-bl-md"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.body}</p>
                    <div
                      className={`text-xs mt-1 ${
                        msg.direction === "outbound" ? "text-green-200" : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {msg.source === "simulator" && " · sim"}
                      {msg.source === "agent" && " · AI"}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Agent Runs */}
            {detail.agentRuns.length > 0 && (
              <div className="px-4 pb-4 border-t border-slate-800 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide font-medium">
                  <Bot className="w-3.5 h-3.5 text-green-400" />
                  AI Analysis
                </div>
                {detail.agentRuns.map((run) => (
                  <AgentRunCard
                    key={run.id}
                    run={run}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
