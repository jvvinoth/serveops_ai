import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/approvals/[id]/reject
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.approvalItem.update({
      where: { id },
      data: { status: "rejected", updatedAt: new Date() },
    });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
  }
}
