import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        customer: true,
        messages: { orderBy: { timestamp: "asc" } },
        agentRuns: {
          orderBy: { createdAt: "desc" },
          include: {
            recommendations: true,
            approvalItems: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
