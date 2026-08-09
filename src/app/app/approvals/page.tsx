"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, RefreshCw, Bot, Clock } from "lucide-react";

interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  content: unknown;
  status: string;
  createdAt: string;
  agentRun: {
    conversation: {
      customer: { name: string; phone: string };
    };
  };
}

const TYPE_META: Record<string, { label: string; bg: string; text: string; border: string }> = {
  sales: { label: "Sales", bg: "bg-blue-900/20", text: "text-blue-400", border: "border-blue-800" },
  ops: { label: "Ops", bg: "bg-orange-900/20", text: "text-orange-400", border: "border-orange-800" },
  admin: { label: "Admin", bg: "bg-purple-900/20", text: "text-purple-400", border: "border-purple-800" },
  call: { label: "Reply", bg: "bg-green-900/20", text: "text-green-400", border: "border-green-800" },
  marketing: { label: "Marketing", bg: "bg-pink-900/20", text: "text-pink-400", border: "border-pink-800" },
  reply: { label: "Reply", bg: "bg-green-900/20", text: "text-green-400", border: "border-green-800" },
  quote: { label: "Quote", bg: "bg-blue-900/20", text: "text-blue-400", border: "border-blue-800" },
  tasks: { label: "Tasks", bg: "bg-purple-900/20", text: "text-purple-400", border: "border-purple-800" },
  restock: { label: "Restock", bg: "bg-orange-900/20", text: "text-orange-400", border: "border-orange-800" },
};

function getMeta(type: string) {
  return TYPE_META[type] ?? { label: type, bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700" };
}

type FilterStatus = "pending" | "approved" | "rejected" | "all";

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("pending");

  const load = async () => {
    try {
      const res = await fetch(`/api/approvals?status=${filter}`);
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [filter]);

  useEffect(() => {
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  const approve = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch(`/api/approvals/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });
      await load();
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch(`/api/approvals/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });
      await load();
    } finally {
      setProcessingId(null);
    }
  };

  const filters: FilterStatus[] = ["pending", "approved", "rejected", "all"];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
          <p className="text-slate-400 text-sm mt-1">Review and act on AI agent recommendations</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-green-700 text-white shadow-sm"
                : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">
            {filter === "pending"
              ? "No pending approvals — all clear!"
              : `No ${filter} items`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const meta = getMeta(item.type);
            const content = item.content as Record<string, unknown> | null;
            const preview =
              content?.whatsappReply ||
              content?.summary ||
              content?.notes ||
              content?.action ||
              content?.recommendation;
            const customer = item.agentRun?.conversation?.customer;
            const isProcessing = processingId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-xl border ${meta.border} ${meta.bg} p-4 transition-opacity ${
                  isProcessing ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Bot className={`w-3.5 h-3.5 ${meta.text} flex-shrink-0`} />
                      <span className={`text-xs font-bold uppercase tracking-wide ${meta.text}`}>
                        {meta.label}
                      </span>
                      {customer && (
                        <span className="text-xs text-slate-500">· {customer.name}</span>
                      )}
                      <span className="ml-auto text-xs text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-white text-sm">{item.title}</h3>

                    {/* Preview */}
                    {!!preview && (
                      <p className={`text-xs ${meta.text} opacity-80 mt-1.5 line-clamp-3 leading-relaxed`}>
                        {String(preview)}
                      </p>
                    )}

                    {/* Quote line items */}
                    {!!content?.items && Array.isArray(content.items) && (
                      <div className="mt-2 text-xs text-slate-400">
                        Items:{" "}
                        {(content.items as Array<Record<string, unknown>>)
                          .map((i) => String(i.name))
                          .join(", ")}
                        {!!content.total && (
                          <span className="ml-2 text-green-400 font-semibold">
                            SGD {String(content.total)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    {item.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approve(item.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isProcessing ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => reject(item.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                          item.status === "approved"
                            ? "bg-green-900/60 text-green-400 border border-green-800"
                            : "bg-slate-700 text-slate-400 border border-slate-600"
                        }`}
                      >
                        {item.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
