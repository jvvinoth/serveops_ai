import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const approvalItemId = textValue(body.approval_item_id || body.approvalItemId);
    const when = textValue(body.when, "Customer agreed to the next available slot");
    const notes = textValue(body.notes);
    const transcriptSummary = textValue(body.transcript_summary || body.transcriptSummary);

    if (!approvalItemId) {
      return NextResponse.json({ error: "approval_item_id is required" }, { status: 400 });
    }

    const callItem = await prisma.approvalItem.findFirst({
      where: {
        id: approvalItemId,
        agentRun: { conversation: { businessId: BUSINESS_ID } },
      },
      include: {
        agentRun: {
          include: {
            conversation: { include: { customer: true } },
          },
        },
      },
    });

    if (!callItem) {
      return NextResponse.json({ error: "Call approval item not found" }, { status: 404 });
    }

    const customer = callItem.agentRun.conversation.customer;
    const created = await prisma.approvalItem.create({
      data: {
        agentRunId: callItem.agentRunId,
        type: "appointment",
        title: `Call booked with ${customer.name}`,
        content: {
          type: "appointment",
          title: `Call booked with ${customer.name}`,
          customerName: customer.name,
          customerPhone: customer.phone,
          scheduledFor: when,
          notes: notes || "Voice agent confirmed the customer is interested.",
          transcriptSummary:
            transcriptSummary ||
            "Customer accepted the proposed next step. Owner should approve the final WhatsApp confirmation before sending.",
          nextStep: "Approve proposal or invoice, then send WhatsApp confirmation.",
        },
        status: "pending",
      },
    });

    await prisma.approvalItem.update({
      where: { id: callItem.id },
      data: {
        content: {
          ...(callItem.content as Record<string, unknown>),
          callOutcome: {
            status: "booked",
            scheduledFor: when,
            notes,
            transcriptSummary,
            appointmentApprovalId: created.id,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, appointmentApprovalId: created.id });
  } catch (error) {
    console.error("book call failed", error);
    return NextResponse.json({ error: "Unable to book call outcome" }, { status: 500 });
  }
}
