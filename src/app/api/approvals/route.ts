import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

// GET /api/approvals — list approval items (filter by ?status=pending|approved|rejected|all, ?type=proposal|invoice|etc)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "all";
  const typeFilter = searchParams.get("type");

  const whereStatus =
    statusFilter === "all" ? {} : { status: statusFilter };

  const whereType = typeFilter ? { type: typeFilter } : {};

  const items = await prisma.approvalItem.findMany({
    where: {
      ...whereStatus,
      ...whereType,
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
