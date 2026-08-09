import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

// GET /api/approvals — list all pending approval items
export async function GET() {
  const items = await prisma.approvalItem.findMany({
    where: {
      status: "pending",
      agentRun: { conversation: { businessId: BUSINESS_ID } },
    },
    include: {
      agentRun: {
        include: {
          conversation: { include: { customer: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}
