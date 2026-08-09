"use client";
import { useEffect, useState, useRef } from "react";
import { MessageSquare, Bot, CheckCircle, XCircle, Loader, ChevronDown, ChevronUp, Phone, Package, FileText } from "lucide-react";

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

const AGENT_COLORS: Record<string, string> = {
  sales: "text-blue-400 bg-blue-900/30 border-blue-800",
  ops: "text-orange-400 bg-orange-900/30 border-orange-800",
  admin: "text-purple-400 bg-purple-900/30 border-purple-800",
  call: "text-green-400 bg-green-900/30 border-green-800",
  marketing: "text-pink-400 bg-pink-900/30 border-pink-800",
  reply: "text-green-400 bg-green-900/30 border-green-800",
  quote: "text-blue-400 bg-blue-900/30 border-blue-800",
  tasks: "text-purple-400 bg-purple-900/30 border-purple-800",
  restock: "text-orange-400 bg-orange-900/30 border-orange-800",
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
type RestockItem = { item: string; qty: number; supplier: string; estimatedCost?: number };

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
  const steps = content.script as CallScriptStep[] | undefined;
  const greeting = content.greeting as string | undefined;
  if (!steps?.length && !greeting) return null;
  return (
    <div className="mt-2 space-y-1.5">
      {!!greeting && (
        <div className="text-xs text-slate-400 bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-700/50">
          <span className="text-slate-500 font-medium">Greeting: </span>{greeting}
        </div>
      )}
      {steps?.map((s, i) => (
        <div key={i} className="bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-700/50">
          <div className="text-xs font-semibold text-green-400 mb-0.5">
            {i + 1}. {s.step}
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">{s.script}</div>
        </div>
      ))}
    </div>
  );
}

function RestockPreview({ content }: { content: Record<string, unknown> }) {
  const items = content.items as RestockItem[] | undefined;
  if (!items?.length) return null;
  return (
    <div className="mt-2 space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center justify-between bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-700/50">
          <div>
            <div className="text-xs font-medium text-slate-200">{it.item}</div>
            <div className="text-xs text-slate-500">{it.supplier}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-orange-300 font-medium">Qty: {it.qty}</div>
            {!!it.estimatedCost && (
              <div className="text-xs text-slate-400">~${it.estimatedCost}</div>
            )}
          </div>
        </div>
      ))}
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
  const colorClass = AGENT_COLORS[item.type] || "text-slate-300 bg-slate-800 border-slate-700";
  const content = item.content as Record<string, unknown> | null;
  const preview =
    content?.whatsappReply ||
    content?.summary ||
    content?.notes ||
    content?.action ||
    content?.recommendation;

  const hasDetails =
    (item.type === "quote" && !!(content?.items as unknown[])?.length) ||
    (item.type === "call" && (!!(content?.script as unknown[])?.length || !!content?.greeting)) ||
    (item.type === "restock" && !!(content?.items as unknown[])?.length);

  const typeIcon =
    item.type === "quote" ? <FileText className="w-3 h-3" /> :
    item.type === "call" ? <Phone className="w-3 h-3" /> :
    item.type === "restock" ? <Package className="w-3 h-3" /> : null;

  return (
    <div className={`rounded-lg border ${colorClass}`}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-70 mb-0.5">
              {typeIcon}
              {item.type}
            </div>
            <div className="text-sm font-semibold text-white">{item.title}</div>
            {!!preview && !expanded && (
              <p className="text-xs opacity-75 mt-1 line-clamp-2">{String(preview)}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {item.status === "pending" && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => onApprove(item.id)}
                  className="flex items-center gap-1 text-xs bg-green-700 hover:bg-green-600 text-white px-2.5 py-1 rounded-md transition-colors font-medium"
                >
                  <CheckCircle className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() => onReject(item.id)}
                  className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-red-700 text-white px-2.5 py-1 rounded-md transition-colors"
                >
                  <XCircle className="w-3 h-3" /> Reject
                </button>
              </div>
            )}
            {item.status !== "pending" && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  item.status === "approved"
                    ? "bg-green-900/60 text-green-400"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {item.status === "approved" ? "✓ Approved" : "✗ Rejected"}
              </span>
            )}
            {hasDetails && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? "Less" : "Details"}
              </button>
            )}
          </div>
        </div>

        {expanded && content && (
          <div className="mt-1">
            {item.type === "quote" && <QuotePreview content={content} />}
            {item.type === "call" && <CallScriptPreview content={content} />}
            {item.type === "restock" && <RestockPreview content={content} />}
            {item.type === "reply" && !!content.whatsappReply && (
              <div className="mt-2 bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-700/50 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {String(content.whatsappReply)}
              </div>
            )}
            {item.type === "tasks" && !!(content.tasks as unknown[])?.length && (
              <div className="mt-2 space-y-1">
                {(content.tasks as string[]).map((t: string, i: number) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-purple-400 mt-0.5">•</span> {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-700">
        <Bot className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs font-semibold text-white uppercase tracking-wide">AI Analysis</span>
        <span
          className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
            run.status === "complete"
              ? "bg-green-900/50 text-green-400"
              : run.status === "running"
              ? "bg-amber-900/50 text-amber-400"
              : "bg-red-900/50 text-red-400"
          }`}
        >
          {run.status}
        </span>
      </div>

      {router && (
        <div className="bg-slate-900/60 px-4 py-3 border-b border-slate-700 text-xs space-y-1.5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {!!router.intent && (
              <div>
                <span className="text-slate-500">Intent</span>
                <span className="text-white ml-1.5">{String(router.intent)}</span>
              </div>
            )}
            {!!router.urgency && (
              <div>
                <span className="text-slate-500">Urgency</span>
                <span
                  className={`ml-1.5 font-medium ${
                    router.urgency === "high"
                      ? "text-red-400"
                      : router.urgency === "medium"
                      ? "text-amber-400"
                      : "text-green-400"
                  }`}
                >
                  {String(router.urgency)}
                </span>
              </div>
            )}
            {(router.estimatedValue as number) > 0 && (
              <div>
                <span className="text-slate-500">Est. Value</span>
                <span className="text-green-400 ml-1.5 font-semibold">
                  {String(router.currency)} {(router.estimatedValue as number).toFixed(0)}
                </span>
              </div>
            )}
            {!!router.agents && (
              <div>
                <span className="text-slate-500">Agents</span>
                <span className="text-white ml-1.5">{(router.agents as string[]).join(", ")}</span>
              </div>
            )}
          </div>
          {!!router.summary && <p className="text-slate-400">{String(router.summary)}</p>}
        </div>
      )}

      {run.approvalItems.length > 0 ? (
        <div className="p-3 space-y-2">
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
          AI agents analyzing...
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
