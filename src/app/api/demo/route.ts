import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

// POST /api/demo/send-sample-message
export async function POST(req: NextRequest) {
  const { scenario = "catering" } = await req.json().catch(() => ({}));

  const scenarios: Record<string, { phone: string; name: string; message: string }> = {
    catering: {
      phone: "+6581234567",
      name: "David Tan",
      message:
        "Hi, I'm David from Tech Corp. We're planning a team lunch on 15 Aug for 40 pax. Can you cater? We need vegetarian options — about 30% of the group. Budget is around $12/pax. Please send a quote.",
    },
    smallorder: {
      phone: "+6591234568",
      name: "Sarah Lim",
      message: "Hi! Can I order 2x Nasi Lemak and 1x Kopi O for takeaway? Collecting in 20 mins.",
    },
    complaint: {
      phone: "+6591234569",
      name: "Raj Kumar",
      message: "Hi, I ordered delivery 45 mins ago and food still hasn't arrived. Can you check?",
    },
    restock: {
      phone: "+6591234570",
      name: "Ahmad (Staff)",
      message: "Boss, we're running low on chicken. Only 5kg left and we have a big lunch crowd tomorrow.",
    },
  };

  const sample = scenarios[scenario] || scenarios.catering;

  // Call inbound endpoint
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/messages/inbound`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...sample, source: "simulator" }),
  });

  const result = await response.json();
  return NextResponse.json(result);
}

// POST /api/demo/reset
export async function DELETE() {
  // Reset all transactional data but keep business master data
  await prisma.approvalItem.deleteMany({ where: { agentRun: { conversation: { businessId: BUSINESS_ID } } } });
  await prisma.recommendation.deleteMany({ where: { agentRun: { conversation: { businessId: BUSINESS_ID } } } });
  await prisma.agentRun.deleteMany({ where: { conversation: { businessId: BUSINESS_ID } } });
  await prisma.message.deleteMany({ where: { conversation: { businessId: BUSINESS_ID } } });
  await prisma.conversation.deleteMany({ where: { businessId: BUSINESS_ID } });
  await prisma.task.deleteMany({ where: { businessId: BUSINESS_ID } });

  return NextResponse.json({ success: true, message: "Demo data reset" });
}
