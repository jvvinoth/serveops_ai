import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

// GET /api/approvals — list approval items (filter by ?status=pending|approved|rejected|all)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "pending";

  const whereStatus =
    statusFilter === "all" ? {} : { status: statusFilter };

  const items = await prisma.approvalItem.findMany({
    where: {
      ...whereStatus,
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
