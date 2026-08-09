import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

export async function GET() {
  const shifts = await prisma.staffShift.findMany({
    where: { businessId: BUSINESS_ID },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(shifts);
}
