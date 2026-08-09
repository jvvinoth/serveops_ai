import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/approvals/[id]/approve
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { editedContent } = await req.json().catch(() => ({ editedContent: null }));

    const item = await prisma.approvalItem.update({
      where: { id },
      data: {
        status: "approved",
        content: editedContent || undefined,
        updatedAt: new Date(),
      },
    });

    // If it's a reply type, create outbound message
    if (item.type === "reply" || item.type === "quote") {
      const content = item.content as Record<string, unknown>;
      const replyText = (content.whatsappReply as string) || JSON.stringify(content);

      const agentRun = await prisma.agentRun.findUnique({
        where: { id: item.agentRunId },
      });

      if (agentRun) {
        await prisma.message.create({
          data: {
            conversationId: agentRun.conversationId,
            direction: "outbound",
            body: replyText,
            source: "agent",
          },
        });
      }
    }

    // If it's a task type, create a task record
    if (item.type === "tasks") {
      const content = item.content as Record<string, unknown>;
      const tasks = content.tasks as Array<Record<string, unknown>>;
      const agentRun = await prisma.agentRun.findUnique({
        where: { id: item.agentRunId },
        include: { conversation: true },
      });

      if (agentRun && tasks) {
        for (const task of tasks) {
          await prisma.task.create({
            data: {
              businessId: agentRun.conversation.businessId,
              title: task.title as string,
              body: task.body as string,
              assignee: task.assignee as string,
              dueAt: task.dueDate ? new Date(task.dueDate as string) : null,
              status: "open",
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
  }
}
