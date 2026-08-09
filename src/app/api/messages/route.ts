import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

// GET /api/messages — list all conversations with messages
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (conversationId) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: "asc" },
    });
    return NextResponse.json(messages);
  }

  const conversations = await prisma.conversation.findMany({
    where: { businessId: BUSINESS_ID },
    include: {
      customer: true,
      messages: { orderBy: { timestamp: "desc" }, take: 1 },
      agentRuns: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { approvalItems: { where: { status: "pending" } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(conversations);
}
