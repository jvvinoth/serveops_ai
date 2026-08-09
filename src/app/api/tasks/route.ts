import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "all";

  const where =
    statusFilter === "all"
      ? { businessId: BUSINESS_ID }
      : { businessId: BUSINESS_ID, status: statusFilter };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const { title, body, assignee, dueAt } = await req.json();
  const task = await prisma.task.create({
    data: {
      businessId: BUSINESS_ID,
      title,
      body: body || null,
      assignee: assignee || null,
      dueAt: dueAt ? new Date(dueAt) : null,
      status: "open",
    },
  });
  return NextResponse.json(task, { status: 201 });
}
