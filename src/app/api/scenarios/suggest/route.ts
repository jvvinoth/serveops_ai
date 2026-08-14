import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";

type SuggestRequest = {
  businessName?: string;
  industry?: string;
  current?: Record<string, unknown>;
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

function fallbackScenario(businessName: string, industry: string) {
  const cleanBusiness = businessName || "Demo SME";
  const cleanIndustry = industry || "SME services";
  return {
    business: {
      businessName: cleanBusiness,
      industry: cleanIndustry,
      offerSummary: `${cleanBusiness} provides practical ${cleanIndustry.toLowerCase()} services for local customers and small businesses.`,
      paymentTerms: "50% deposit to confirm, balance after service completion by PayNow or bank transfer.",
      availability: "Tomorrow 10am, tomorrow 3pm, or Friday 11am",
      tone: "warm, concise, professional",
      servicesText: [
        `Starter ${cleanIndustry} Package | 180 | Entry-level service package for first-time customers`,
        `Standard ${cleanIndustry} Package | 480 | Recommended package with consultation and follow-up`,
        `Premium ${cleanIndustry} Package | 980 | Full-service package with priority support`,
      ].join("\n"),
    },
    customer: {
      name: "Alicia Tan",
      company: "New customer",
      phone: "+6597001299",
      segment: cleanIndustry,
      message: `Hi, I am interested in ${cleanBusiness}. Can you share package options, arrange a call or appointment, and send an invoice if we confirm?`,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SuggestRequest;
    const businessName = text(body.businessName || body.current?.businessName, "Demo SME");
    const industry = text(body.industry || body.current?.industry, "SME services");

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ scenario: fallbackScenario(businessName, industry), source: "fallback" });
    }

    const system = [
      "You create realistic hackathon demo scenarios for an AI operating team for SMEs.",
      "Output only valid JSON.",
      "Make the scenario specific to Singapore SMEs and practical for WhatsApp operations.",
      "Prices must be realistic in SGD.",
      "Services text must use exactly this line format: Service name | SGD price | short description.",
      "Do not include markdown.",
    ].join(" ");

    const user = JSON.stringify({
      businessName,
      industry,
      current: body.current ?? {},
      requiredShape: {
        business: {
          businessName: "string",
          industry: "string",
          offerSummary: "one sentence",
          paymentTerms: "one sentence",
          availability: "three appointment slots in plain English",
          tone: "three comma-separated tone words",
          servicesText: "three newline-separated services in format: Service name | SGD price | short description",
        },
        customer: {
          name: "realistic Singapore customer name",
          company: "customer context",
          phone: "+65970012xx",
          segment: "short scenario segment",
          message:
            "one WhatsApp message asking for package/pricing, proposal or quote, appointment/call, and invoice/deposit if confirmed",
        },
      },
    });

    const raw = await callLLM(system, user);
    const parsed = parseJson(raw);
    const scenario = parsed?.business && parsed?.customer ? parsed : fallbackScenario(businessName, industry);

    return NextResponse.json({ scenario, source: parsed?.business ? "llm" : "fallback" });
  } catch (error) {
    console.error("scenario suggestion failed", error);
    return NextResponse.json({ error: "Unable to generate scenario" }, { status: 500 });
  }
}
