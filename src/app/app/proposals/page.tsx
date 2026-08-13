"use client";
import { useEffect, useState } from "react";
import { Briefcase, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader } from "lucide-react";

interface ProposalSlide {
  slideNumber: number;
  title: string;
  content: string;
  bullets?: string[];
}

interface PricingSummary {
  packageName: string;
  totalSgd: number;
  depositSgd: number;
  paymentTerms: string;
}

interface ProposalContent {
  title?: string;
  client?: { name?: string; business?: string; requirement?: string };
  slides?: ProposalSlide[];
  pricingSummary?: PricingSummary;
  nextSteps?: string[];
  whatsappMessage?: string;
}

interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  content: ProposalContent;
  status: string;
  createdAt: string;
}

function timeAgo(date: string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function ProposalCard({
  item,
  onApprove,
  onReject,
}: {
  item: ApprovalItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const c = item.content;

  return (
    <div className="bg-slate-800 rounded-xl border border-indigo-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-900/50 border border-indigo-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">{c.title ?? item.title}</div>
              {c.client && (
                <div className="text-xs text-slate-400 mt-0.5">
                  {c.client.name}{c.client.business ? ` · ${c.client.business}` : ""}
                </div>
              )}
              <div className="text-xs text-slate-600 mt-1">{timeAgo(item.createdAt)}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {item.status === "pending" && (
              <>
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
                  <XCircle className="w-3 h-3" /> Skip
                </button>
              </>
            )}
            {item.status !== "pending" && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                item.status === "approved" ? "bg-green-900/60 text-green-400" : "bg-slate-700 text-slate-400"
              }`}>
                {item.status === "approved" ? "✓ Sent" : "✗ Skipped"}
              </span>
            )}
          </div>
        </div>

        {/* Pricing summary */}
        {c.pricingSummary && (
          <div className="mt-3 flex items-center justify-between bg-indigo-900/20 border border-indigo-800/40 rounded-lg px-3 py-2">
            <div>
              <div className="text-xs font-medium text-white">{c.pricingSummary.packageName}</div>
              <div className="text-xs text-slate-500">{c.pricingSummary.paymentTerms}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-indigo-300">SGD {c.pricingSummary.totalSgd?.toFixed(0)}</div>
              <div className="text-xs text-slate-500">Deposit: SGD {c.pricingSummary.depositSgd?.toFixed(0)}</div>
            </div>
          </div>
        )}

        {/* WhatsApp message preview */}
        {c.whatsappMessage && (
          <div className="mt-2 text-xs text-slate-400 bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/40 line-clamp-2">
            {c.whatsappMessage}
          </div>
        )}
      </div>

      {/* Slide deck */}
      {c.slides && c.slides.length > 0 && (
        <div className="px-5 py-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Hide slides" : `View ${c.slides.length} slides`}
          </button>

          {expanded && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {c.slides.map((slide) => (
                <div key={slide.slideNumber} className="bg-slate-900/60 rounded-lg px-3 py-2.5 border border-indigo-900/40">
                  <div className="text-xs font-semibold text-indigo-400 mb-1">
                    {slide.slideNumber}. {slide.title}
                  </div>
                  {slide.bullets?.slice(0, 3).map((b, i) => (
                    <div key={i} className="text-xs text-slate-400 flex gap-1.5 leading-relaxed">
                      <span className="text-indigo-600 flex-shrink-0">·</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Next steps */}
          {expanded && c.nextSteps && c.nextSteps.length > 0 && (
            <div className="mt-2 border-t border-slate-700/40 pt-2">
              <div className="text-xs text-slate-500 font-medium mb-1">Next Steps</div>
              {c.nextSteps.map((step, i) => (
                <div key={i} className="text-xs text-slate-400 flex gap-2 leading-relaxed">
                  <span className="text-indigo-400 font-bold">{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/approvals?type=proposal");
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id: string) => {
    await fetch(`/api/approvals/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    load();
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/approvals/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    load();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Proposals</h1>
        <p className="text-slate-400 text-sm mt-1">
          AI-generated service proposals and pitch decks ready to send to clients
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Briefcase className="w-12 h-12 text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm font-medium">No proposals yet</p>
          <p className="text-slate-600 text-xs mt-1">
            Trigger a demo scenario from Command Center to generate proposals
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{proposals.length} proposal{proposals.length !== 1 ? "s" : ""}</span>
            <span>{proposals.filter(p => p.status === "pending").length} pending approval</span>
          </div>
          {proposals.map((item) => (
            <ProposalCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
