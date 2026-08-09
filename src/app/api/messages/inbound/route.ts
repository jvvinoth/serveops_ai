import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runFullPipeline } from "@/ai/pipeline";
import { BUSINESS_ID } from "@/lib/utils";

// POST /api/messages/inbound — receive WhatsApp or simulator message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, name, message, source = "whatsapp" } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: "phone and message are required" }, { status: 400 });
    }

    // Upsert customer
    let customer = await prisma.customer.findFirst({
      where: { businessId: BUSINESS_ID, phone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          businessId: BUSINESS_ID,
          name: name || phone,
          phone,
        },
      });
    }

    // Upsert conversation (open one or create new)
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
    const msg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "inbound",
        body: message,
        source,
      },
    });

    // Kick off agent pipeline (non-blocking)
    runFullPipeline(conversation.id, message, BUSINESS_ID).catch(console.error);

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      messageId: msg.id,
    });
  } catch (error) {
    console.error("Inbound message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/messages/inbound — list recent conversations with last message
export async function GET() {
  const conversations = await prisma.conversation.findMany({
    where: { businessId: BUSINESS_ID },
    include: {
      customer: true,
      messages: { orderBy: { timestamp: "desc" }, take: 1 },
      agentRuns: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(conversations);
}
