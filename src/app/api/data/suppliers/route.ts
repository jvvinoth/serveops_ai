import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BUSINESS_ID } from "@/lib/utils";

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    where: { businessId: BUSINESS_ID },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(suppliers);
}
