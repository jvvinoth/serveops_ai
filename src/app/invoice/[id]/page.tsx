import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";
import PrintButton from "@/app/PrintButton";

export const dynamic = "force-dynamic";

type LineItem = {
  description?: string;
  qty?: number;
  unitPrice?: number;
  subtotal?: number;
};

type InvoiceContent = {
  title?: string;
  invoiceNumber?: string;
  status?: string;
  issueDate?: string;
  dueDate?: string;
  billFrom?: { businessName?: string; address?: string; email?: string; phone?: string };
  billTo?: { name?: string; businessName?: string; phone?: string };
  lineItems?: LineItem[];
  subtotalSgd?: number;
  discountSgd?: number;
  gstSgd?: number;
  totalSgd?: number;
  depositDueSgd?: number;
  balanceDueSgd?: number;
  paymentInstructions?: string;
  notes?: string;
  whatsappMessage?: string;
};

function asInvoice(value: unknown): InvoiceContent {
  return (value ?? {}) as InvoiceContent;
}

function money(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.approvalItem.findFirst({
    where: {
      id,
      type: "invoice",
      agentRun: { conversation: { businessId: BUSINESS_ID } },
    },
    include: {
      agentRun: {
        include: {
          conversation: { include: { customer: true } },
        },
      },
    },
  });

  if (!item) notFound();

  const invoice = asInvoice(item.content);
  const customer = item.agentRun.conversation.customer;
  const lineItems = invoice.lineItems ?? [];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-6 text-white print:bg-white print:p-0 print:text-slate-950">
      <div className="mx-auto mb-5 flex max-w-5xl items-center justify-between print:hidden">
        <Link href="/app" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Live Demo
        </Link>
        <PrintButton />
      </div>

      <section className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-800 bg-white text-slate-950 shadow-2xl shadow-black/30 print:rounded-none print:border-0 print:shadow-none">
        <header className="bg-slate-950 px-10 py-9 text-white print:bg-slate-950">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                <Receipt className="h-3.5 w-3.5" />
                AI-generated invoice
              </div>
              <h1 className="text-4xl font-bold">Invoice</h1>
              <p className="mt-2 text-slate-400">{invoice.title ?? item.title}</p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-sm uppercase tracking-wide text-slate-500">Invoice Number</div>
              <div className="mt-1 text-2xl font-bold">{invoice.invoiceNumber ?? item.id.slice(0, 10).toUpperCase()}</div>
              <div className="mt-4 rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                {(invoice.status ?? item.status).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-10">
          <section className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Bill From</div>
              <div className="mt-3 text-lg font-bold">{invoice.billFrom?.businessName ?? "BrightLane Studio"}</div>
              <div className="mt-1 text-sm leading-relaxed text-slate-600">
                {invoice.billFrom?.address ?? "Singapore"}
                <br />
                {invoice.billFrom?.email ?? "hello@brightlane.studio"}
                <br />
                {invoice.billFrom?.phone ?? "+65 9000 0000"}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Bill To</div>
              <div className="mt-3 text-lg font-bold">{invoice.billTo?.name ?? customer.name}</div>
              <div className="mt-1 text-sm leading-relaxed text-slate-600">
                {invoice.billTo?.businessName ?? customer.company ?? "Customer"}
                <br />
                {invoice.billTo?.phone ?? customer.phone}
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Issue Date</div>
              <div className="mt-1 font-semibold">{invoice.issueDate ?? new Date(item.createdAt).toISOString().split("T")[0]}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Due Date</div>
              <div className="mt-1 font-semibold">{invoice.dueDate ?? "14 days from issue"}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Payment Terms</div>
              <div className="mt-1 font-semibold">50% upfront, balance before delivery</div>
            </div>
          </section>

          <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-950 text-white">
                  <th className="px-5 py-4 text-left font-semibold">Description</th>
                  <th className="px-5 py-4 text-right font-semibold">Qty</th>
                  <th className="px-5 py-4 text-right font-semibold">Unit Price</th>
                  <th className="px-5 py-4 text-right font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((line, index) => (
                  <tr key={`${line.description}-${index}`} className="border-b border-slate-200 last:border-0">
                    <td className="px-5 py-4 font-medium">{line.description}</td>
                    <td className="px-5 py-4 text-right text-slate-600">{line.qty ?? 1}</td>
                    <td className="px-5 py-4 text-right text-slate-600">{money(line.unitPrice)}</td>
                    <td className="px-5 py-4 text-right font-semibold">{money(line.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-8 flex justify-end">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">{money(invoice.subtotalSgd)}</span>
              </div>
              {(invoice.discountSgd ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-semibold">-{money(invoice.discountSgd)}</span>
                </div>
              )}
              {(invoice.gstSgd ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">GST</span>
                  <span className="font-semibold">{money(invoice.gstSgd)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{money(invoice.totalSgd)}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Deposit Due</span>
                  <span className="font-bold text-emerald-900">{money(invoice.depositDueSgd)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Balance Due</span>
                  <span className="font-semibold">{money(invoice.balanceDueSgd)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Payment Instructions</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {invoice.paymentInstructions ?? "PayNow / bank transfer. Please reference the invoice number."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Customer Message</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {invoice.whatsappMessage ?? invoice.notes ?? "Invoice ready for owner approval."}
              </p>
            </div>
          </section>
        </div>
      </section>

    </main>
  );
}
