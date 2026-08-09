import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runFullPipeline } from "@/ai/pipeline";
import { BUSINESS_ID } from "@/lib/utils";

// POST /api/wa/webhook — WAHA sends messages here
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // WAHA webhook payload format
    const event = body.event;
    if (event !== "message") return NextResponse.json({ ok: true });

    const payload = body.payload;
    const from = payload?.from?.replace("@c.us", "") || "";
    const messageText = payload?.body || "";
    const senderName = payload?._data?.notifyName || from;

    if (!from || !messageText) return NextResponse.json({ ok: true });

    // Upsert customer
    let customer = await prisma.customer.findFirst({
      where: { businessId: BUSINESS_ID, phone: `+${from}` },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { businessId: BUSINESS_ID, name: senderName, phone: `+${from}` },
      });
    }

    // Upsert conversation
    let conversation = await prisma.conversation.findFirst({
      where: { businessId: BUSINESS_ID, customerId: customer.id, status: "open" },
      orderBy: { createdAt: "desc" },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { businessId: BUSINESS_ID, customerId: customer.id },
      });
    }

    // Save message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "inbound",
        body: messageText,
        source: "whatsapp",
      },
    });

    // Run pipeline
    runFullPipeline(conversation.id, messageText, BUSINESS_ID).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WAHA webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
