import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

type BusinessProfile = {
  businessName?: string;
  industry?: string;
  offerSummary?: string;
  paymentTerms?: string;
  availability?: string;
  tone?: string;
  services?: Array<{ name: string; priceSgd: number; description?: string }>;
};

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function livekitHttpUrl(url: string) {
  return url.replace("wss://", "https://").replace("ws://", "http://");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const approvalItemId = textValue(body.approvalItemId);
    const profile = (body.businessProfile ?? {}) as BusinessProfile;

    if (!approvalItemId) {
      return NextResponse.json({ error: "approvalItemId is required" }, { status: 400 });
    }

    const livekitUrl = process.env.LIVEKIT_URL;
    const livekitApiKey = process.env.LIVEKIT_API_KEY;
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
      return NextResponse.json(
        {
          error: "LiveKit environment is not configured",
          missing: ["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"].filter((key) => !process.env[key]),
        },
        { status: 503 }
      );
    }

    const item = await prisma.approvalItem.findFirst({
      where: {
        id: approvalItemId,
        agentRun: { conversation: { businessId: BUSINESS_ID } },
      },
      include: {
        agentRun: {
          include: {
            conversation: {
              include: {
                customer: true,
                messages: { orderBy: { timestamp: "desc" }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Approval item not found" }, { status: 404 });
    }

    const content = asRecord(item.content);
    const script = asRecord(content.script);
    const slots = asArray<{ label?: string; date?: string; time?: string }>(content.suggestedAppointmentSlots);
    const firstSlot = slots[0];
    const customer = item.agentRun.conversation.customer;
    const latestMessage = item.agentRun.conversation.messages[0]?.body ?? "";
    const services = profile.services?.filter((service) => service.name && Number(service.priceSgd) > 0) ?? [];
    const recommendedService =
      services.find((service) => latestMessage.toLowerCase().includes(service.name.toLowerCase().split(" ")[0] ?? "")) ??
      services[0];
    const availability =
      profile.availability ||
      firstSlot?.label ||
      [firstSlot?.date, firstSlot?.time].filter(Boolean).join(" ") ||
      "tomorrow afternoon or the next available weekday morning";
    const businessName = profile.businessName || "ServeOps AI customer";
    const room = `serveops-${approvalItemId.slice(0, 8)}-${Date.now().toString().slice(-5)}`;
    const metadata = JSON.stringify({
      approval_item_id: item.id,
      agent_run_id: item.agentRunId,
      customer_name: customer.name,
      customer_phone: customer.phone,
      owner_business: businessName,
      industry: profile.industry || "SME business",
      offer_summary: profile.offerSummary || textValue(content.reason, "Customer asked for service details and next steps."),
      service_name: recommendedService?.name || textValue(item.title, "recommended package"),
      service_price_sgd: recommendedService?.priceSgd ?? null,
      payment_terms: profile.paymentTerms || "PayNow or bank transfer after owner approval.",
      availability,
      brand_voice: profile.tone || "warm, concise, professional",
      call_goal: textValue(
        content.reason,
        "Confirm the customer request, answer simple questions, and book the best appointment slot."
      ),
      script_opening: textValue(script.opening),
      script_closing: textValue(script.closing),
      key_points: asArray<string>(script.keyPoints),
      latest_whatsapp_message: latestMessage,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/api/calls/book`,
    });

    try {
      const roomService = new RoomServiceClient(livekitHttpUrl(livekitUrl), livekitApiKey, livekitApiSecret);
      await roomService.createRoom({ name: room, metadata, emptyTimeout: 300, maxParticipants: 3 });
    } catch {
      // Room may already exist if the button is double-clicked; the join token is still what matters for the demo.
    }

    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: `owner-${Date.now()}`,
      name: "ServeOps owner",
      metadata,
    });
    token.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

    return NextResponse.json({
      url: livekitUrl,
      token: await token.toJwt(),
      room,
      metadata: JSON.parse(metadata),
    });
  } catch (error) {
    console.error("start call failed", error);
    return NextResponse.json({ error: "Unable to start call" }, { status: 500 });
  }
}
