import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MonitorPlay } from "lucide-react";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";
import PrintButton from "@/app/PrintButton";

export const dynamic = "force-dynamic";

type Slide = {
  slideNumber?: number;
  title?: string;
  content?: string;
  bullets?: string[];
};

type PricingSummary = {
  packageName?: string;
  totalSgd?: number;
  depositSgd?: number;
  paymentTerms?: string;
};

type ProposalContent = {
  title?: string;
  client?: { name?: string; business?: string; requirement?: string };
  proposedBy?: { business?: string; contactName?: string; date?: string; validUntil?: string };
  slides?: Slide[];
  pricingSummary?: PricingSummary;
  nextSteps?: string[];
  whatsappMessage?: string;
  notes?: string;
};

function asProposal(value: unknown): ProposalContent {
  return (value ?? {}) as ProposalContent;
}

function money(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.approvalItem.findFirst({
    where: {
      id,
      type: "proposal",
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

  const content = asProposal(item.content);
  const slides = content.slides?.length ? content.slides : [
    { slideNumber: 1, title: content.title ?? item.title, content: content.notes ?? "Generated proposal" },
  ];
  const customer = item.agentRun.conversation.customer;
  const clientName = content.client?.name ?? customer.name;
  const clientBusiness = content.client?.business ?? customer.company ?? "Client";

  return (
    <main className="min-h-screen bg-[#080b12] text-white print:bg-white print:text-slate-950">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#080b12]/90 px-6 py-3 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/app" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Live Demo
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 print:p-0">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-slate-950 to-emerald-950 p-8 print:rounded-none print:border-0 print:bg-white">
          <div className="mb-14 flex items-start justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200 print:border-slate-300 print:bg-slate-100 print:text-slate-700">
                <MonitorPlay className="h-3.5 w-3.5" />
                AI-generated proposal deck
              </div>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl print:text-4xl">
                {content.title ?? item.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300 print:text-slate-700">
                Prepared for {clientName}{clientBusiness ? `, ${clientBusiness}` : ""}. Generated from a customer message by ServeOps AI.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-right print:border-slate-200 print:bg-slate-50">
              <div className="text-xs uppercase tracking-wide text-slate-500">Prepared by</div>
              <div className="mt-1 text-lg font-bold text-white print:text-slate-950">
                {content.proposedBy?.business ?? "BrightLane Studio"}
              </div>
              <div className="mt-2 text-xs text-slate-400 print:text-slate-600">
                Valid until {content.proposedBy?.validUntil ?? "7 days from issue"}
              </div>
            </div>
          </div>

          {content.pricingSummary && (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 print:border-slate-200 print:bg-slate-50">
                <div className="text-xs uppercase tracking-wide text-slate-500">Package</div>
                <div className="mt-1 text-xl font-bold text-white print:text-slate-950">{content.pricingSummary.packageName}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 print:border-slate-200 print:bg-slate-50">
                <div className="text-xs uppercase tracking-wide text-slate-500">Investment</div>
                <div className="mt-1 text-xl font-bold text-emerald-200 print:text-slate-950">{money(content.pricingSummary.totalSgd)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 print:border-slate-200 print:bg-slate-50">
                <div className="text-xs uppercase tracking-wide text-slate-500">Deposit</div>
                <div className="mt-1 text-xl font-bold text-indigo-200 print:text-slate-950">{money(content.pricingSummary.depositSgd)}</div>
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-5">
          {slides.map((slide, index) => (
            <article
              key={`${slide.title}-${index}`}
              className="min-h-[440px] rounded-[1.75rem] border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-black/20 print:min-h-[700px] print:break-after-page print:rounded-none print:border-0 print:bg-white print:shadow-none"
            >
              <div className="mb-8 flex items-start justify-between gap-6">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300 print:text-slate-500">
                    Slide {slide.slideNumber ?? index + 1}
                  </div>
                  <h2 className="mt-3 max-w-4xl text-3xl font-bold text-white md:text-5xl print:text-4xl print:text-slate-950">
                    {slide.title}
                  </h2>
                </div>
                <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 md:block print:border-slate-200 print:bg-slate-100 print:text-slate-600">
                  ServeOps AI
                </div>
              </div>

              {slide.content && (
                <p className="mb-8 max-w-4xl text-lg leading-relaxed text-slate-300 print:text-slate-700">
                  {slide.content}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                {(slide.bullets ?? []).slice(0, 6).map((bullet) => (
                  <div key={bullet} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 print:border-slate-200 print:bg-slate-50">
                    <div className="mb-3 h-1 w-10 rounded-full bg-emerald-400" />
                    <p className="text-base leading-relaxed text-slate-100 print:text-slate-800">{bullet}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        {content.nextSteps?.length ? (
          <section className="mt-5 rounded-[1.75rem] border border-emerald-500/20 bg-emerald-500/10 p-8 print:break-before-page print:rounded-none print:border-0 print:bg-white">
            <h2 className="text-3xl font-bold text-white print:text-slate-950">Next Steps</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {content.nextSteps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-black/20 p-5 print:border-slate-200 print:bg-slate-50">
                  <div className="text-sm font-bold text-emerald-200 print:text-emerald-700">Step {index + 1}</div>
                  <p className="mt-2 text-slate-100 print:text-slate-800">{step}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

    </main>
  );
}
