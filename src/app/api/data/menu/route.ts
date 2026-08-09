import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    where: { businessId: BUSINESS_ID },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(items);
}

export async function PATCH(req: NextRequest) {
  const { id, available } = await req.json();
  const item = await prisma.menuItem.update({
    where: { id },
    data: { available },
  });
  return NextResponse.json(item);
}
