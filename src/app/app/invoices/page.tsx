"use client";
import { useEffect, useState } from "react";
import { Receipt, CheckCircle, XCircle, Loader } from "lucide-react";

interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

interface BillTo {
  name?: string;
  businessName?: string;
  phone?: string;
}

interface InvoiceContent {
  title?: string;
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  billTo?: BillTo;
  lineItems?: LineItem[];
  subtotalSgd?: number;
  gstSgd?: number;
  discountSgd?: number;
  totalSgd?: number;
  depositDueSgd?: number;
  balanceDueSgd?: number;
  paymentInstructions?: string;
  notes?: string;
  whatsappMessage?: string;
}

interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  content: InvoiceContent;
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

function InvoiceCard({
  item,
  onApprove,
  onReject,
}: {
  item: ApprovalItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const c = item.content;

  return (
    <div className="bg-slate-800 rounded-xl border border-emerald-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-900/40 border border-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Receipt className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">{c.invoiceNumber ?? item.title}</div>
              {c.billTo && (
                <div className="text-xs text-slate-400 mt-0.5">
                  {c.billTo.name}{c.billTo.businessName ? ` · ${c.billTo.businessName}` : ""}
                  {c.billTo.phone ? ` · ${c.billTo.phone}` : ""}
                </div>
              )}
              <div className="flex gap-3 mt-1 text-xs text-slate-600">
                {c.issueDate && <span>Issued: {c.issueDate}</span>}
                {c.dueDate && <span>Due: {c.dueDate}</span>}
                <span>{timeAgo(item.createdAt)}</span>
              </div>
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
      </div>

      {/* Line items table */}
      {c.lineItems && c.lineItems.length > 0 && (
        <div className="px-5 py-3">
          <div className="bg-slate-900/60 rounded-lg border border-emerald-900/30 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-500">
                  <th className="text-left px-3 py-2 font-medium">Description</th>
                  <th className="text-right px-3 py-2 font-medium">Qty</th>
                  <th className="text-right px-3 py-2 font-medium">Unit Price</th>
                  <th className="text-right px-3 py-2 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {c.lineItems.map((item, i) => (
                  <tr key={i} className={i < c.lineItems!.length - 1 ? "border-b border-slate-800/40" : ""}>
                    <td className="px-3 py-2 text-slate-200">{item.description}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{item.qty}</td>
                    <td className="px-3 py-2 text-right text-slate-400">SGD {Number(item.unitPrice).toFixed(0)}</td>
                    <td className="px-3 py-2 text-right text-emerald-400 font-medium">SGD {Number(item.subtotal).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-slate-700/50 bg-slate-900/40">
              {(c.discountSgd ?? 0) > 0 && (
                <div className="flex justify-between px-3 py-1.5 text-xs">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-amber-400">− SGD {Number(c.discountSgd).toFixed(0)}</span>
                </div>
              )}
              {(c.gstSgd ?? 0) > 0 && (
                <div className="flex justify-between px-3 py-1.5 text-xs">
                  <span className="text-slate-400">GST (9%)</span>
                  <span className="text-slate-300">SGD {Number(c.gstSgd).toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between px-3 py-2 text-sm font-bold border-t border-slate-700/50">
                <span className="text-white">Total</span>
                <span className="text-emerald-300">SGD {Number(c.totalSgd ?? 0).toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Deposit / balance */}
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <div className="bg-emerald-900/15 border border-emerald-800/40 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-500 mb-0.5">Deposit Due</div>
              <div className="text-sm font-bold text-emerald-300">SGD {Number(c.depositDueSgd ?? 0).toFixed(0)}</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-500 mb-0.5">Balance Due</div>
              <div className="text-sm font-bold text-slate-200">SGD {Number(c.balanceDueSgd ?? 0).toFixed(0)}</div>
            </div>
          </div>

          {/* Payment instructions */}
          {c.paymentInstructions && (
            <div className="mt-2 text-xs text-slate-500 bg-slate-900/30 rounded px-3 py-2 border border-slate-700/30">
              {c.paymentInstructions}
            </div>
          )}

          {/* WhatsApp message */}
          {c.whatsappMessage && (
            <div className="mt-2 text-xs text-slate-400 bg-slate-900/30 rounded-lg px-3 py-2 border border-slate-700/30 italic">
              &ldquo;{c.whatsappMessage}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/approvals?type=invoice");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
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
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <p className="text-slate-400 text-sm mt-1">
          AI-drafted invoices with line items and payment terms, ready to send
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="w-12 h-12 text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm font-medium">No invoices yet</p>
          <p className="text-slate-600 text-xs mt-1">
            Invoices are created when a deal is confirmed via WhatsApp
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</span>
            <span>{invoices.filter(i => i.status === "pending").length} pending approval</span>
          </div>
          {invoices.map((item) => (
            <InvoiceCard
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
