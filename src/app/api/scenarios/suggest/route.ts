import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";

type SuggestRequest = {
  businessName?: string;
  industry?: string;
  current?: Record<string, unknown>;
  targetSection?: "business" | "customer";
  targetField?: string;
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

function fallbackField(targetSection: "business" | "customer", targetField: string, businessName: string, industry: string) {
  const scenario = fallbackScenario(businessName, industry);
  const source = targetSection === "business" ? scenario.business : scenario.customer;
  return source[targetField as keyof typeof source] ?? "";
}

const FIELD_GUIDANCE: Record<string, string> = {
  "business.businessName": "Suggest one realistic SME business name. Return only the name.",
  "business.industry": "Suggest one concise industry/category. Return only the industry.",
  "business.offerSummary": "Write one practical sentence explaining what this SME offers.",
  "business.paymentTerms": "Write one concise Singapore SME payment term sentence.",
  "business.availability": "Suggest three realistic appointment slots in plain English.",
  "business.tone": "Suggest three comma-separated tone words.",
  "business.servicesText":
    "Create exactly three newline-separated service lines. Format each line exactly: Service name | SGD price | short description. Prices must be realistic for the typed business/industry.",
  "customer.name": "Suggest one realistic Singapore customer name. Return only the name.",
  "customer.company": "Suggest one short customer context, such as Parent inquiry, Cafe owner, Office manager, or Homeowner.",
  "customer.phone": "Suggest one fake Singapore demo phone number starting with +65970012.",
  "customer.segment": "Suggest one short customer scenario segment.",
  "customer.message":
    "Write one realistic WhatsApp customer message based on the business profile and service catalog. It should ask for package/pricing, booking/call or appointment, and invoice/deposit if confirmed.",
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SuggestRequest;
    const businessName = text(body.businessName || body.current?.businessName, "Demo SME");
    const industry = text(body.industry || body.current?.industry, "SME services");
    const targetSection = body.targetSection;
    const targetField = body.targetField;

    if (targetSection && targetField) {
      if (!process.env.OPENROUTER_API_KEY) {
        return NextResponse.json({
          value: fallbackField(targetSection, targetField, businessName, industry),
          source: "fallback",
        });
      }

      const fieldKey = `${targetSection}.${targetField}`;
      const system = [
        "You generate exactly one field for an SME hackathon demo scenario.",
        "Use the provided business/customer context.",
        "Output only valid JSON in this shape: {\"value\":\"...\"}.",
        "Do not update unrelated fields.",
        FIELD_GUIDANCE[fieldKey] || "Return a concise realistic value for this field.",
      ].join(" ");

      const raw = await callLLM(
        system,
        JSON.stringify({
          targetSection,
          targetField,
          businessName,
          industry,
          current: body.current ?? {},
        })
      );
      const parsed = parseJson(raw);
      const value = text(parsed?.value, text(fallbackField(targetSection, targetField, businessName, industry)));
      return NextResponse.json({ value, source: parsed?.value ? "llm" : "fallback" });
    }

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
