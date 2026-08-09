import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalConversations,
    openConversations,
    pendingApprovals,
    agentRunsToday,
    messagesTotal,
  ] = await Promise.all([
    prisma.conversation.count({ where: { businessId: BUSINESS_ID } }),
    prisma.conversation.count({ where: { businessId: BUSINESS_ID, status: "open" } }),
    prisma.approvalItem.count({ where: { status: "pending", agentRun: { conversation: { businessId: BUSINESS_ID } } } }),
    prisma.agentRun.count({ where: { createdAt: { gte: today }, conversation: { businessId: BUSINESS_ID } } }),
    prisma.message.count({ where: { conversation: { businessId: BUSINESS_ID } } }),
  ]);

  return NextResponse.json({
    totalConversations,
    openConversations,
    pendingApprovals,
    agentRunsToday,
    messagesTotal,
    activeAgents: 5,
  });
}
