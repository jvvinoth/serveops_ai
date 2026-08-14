"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, ExternalLink, FileText, Loader2, Receipt, RefreshCw } from "lucide-react";

type ApprovalItem = {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  status: string;
  createdAt: string;
  agentRun?: {
    conversation?: {
      customer?: {
        name?: string;
        phone?: string;
      };
    };
  };
};

function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function docKind(type: string) {
  if (type === "proposal" || type === "pitch_deck") return "proposal";
  if (type === "invoice") return "invoice";
  return "other";
}

function docUrl(item: ApprovalItem) {
  const kind = docKind(item.type);
  if (kind === "proposal") return `/deck/${item.id}`;
  if (kind === "invoice") return `/invoice/${item.id}`;
  return "/app/approvals";
}

function titleFor(item: ApprovalItem) {
  return String(item.content?.title ?? item.title);
}

export default function GeneratedDocsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [proposalRes, invoiceRes] = await Promise.all([
        fetch("/api/approvals?type=proposal", { cache: "no-store" }),
        fetch("/api/approvals?type=invoice", { cache: "no-store" }),
      ]);
      const proposals = proposalRes.ok ? await proposalRes.json() : [];
      const invoices = invoiceRes.ok ? await invoiceRes.json() : [];
      setItems([...proposals, ...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const counts = useMemo(() => ({
    proposals: items.filter((item) => docKind(item.type) === "proposal").length,
    invoices: items.filter((item) => docKind(item.type) === "invoice").length,
  }), [items]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Generated Docs</h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time proposal decks and invoice pages generated from customer messages.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      <section className="mb-6 grid gap-3 md:grid-cols-3">
        {[
          { label: "Proposal decks", value: counts.proposals, icon: Briefcase, color: "text-indigo-300" },
          { label: "Invoices", value: counts.invoices, icon: Receipt, color: "text-emerald-300" },
          { label: "Total docs", value: items.length, icon: FileText, color: "text-slate-300" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</span>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-700" />
          <p className="text-sm font-medium text-slate-400">No generated docs yet.</p>
          <p className="mt-1 text-xs text-slate-600">Go to Live Demo, send a customer message, and wait for the agents.</p>
          <Link href="/app" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
            Open Live Demo
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const kind = docKind(item.type);
            const isProposal = kind === "proposal";
            const pricing = item.content?.pricingSummary as { totalSgd?: number; packageName?: string } | undefined;
            const customer = item.agentRun?.conversation?.customer;
            return (
              <article key={item.id} className={`rounded-2xl border bg-slate-900 p-5 ${
                isProposal ? "border-indigo-500/20" : "border-emerald-500/20"
              }`}>
                <div className="mb-4 flex items-start gap-3">
                  <div className={`rounded-xl border p-2 ${
                    isProposal
                      ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  }`}>
                    {isProposal ? <Briefcase className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      {isProposal ? "Pitch deck" : "Invoice"}
                    </div>
                    <h2 className="mt-1 truncate text-base font-bold text-white">{titleFor(item)}</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {customer?.name ?? "Customer"} · {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                  {isProposal ? (
                    <>
                      <div className="font-semibold text-white">{pricing?.packageName ?? "Generated proposal deck"}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {Array.isArray(item.content?.slides) ? `${item.content.slides.length} slides` : "Slide deck"} · Total SGD {asNumber(pricing?.totalSgd).toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-white">{String(item.content?.invoiceNumber ?? "Draft invoice")}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Total SGD {asNumber(item.content?.totalSgd).toLocaleString()} · Deposit SGD {asNumber(item.content?.depositDueSgd).toLocaleString()}
                      </div>
                    </>
                  )}
                </div>

                <Link
                  href={docUrl(item)}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                >
                  {isProposal ? "Open Deck" : "Open Invoice"}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

