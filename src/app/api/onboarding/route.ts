import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { neonAuth } from "@/lib/auth/server";

export async function POST(req: NextRequest) {
  try {
    // Better Auth server: call getSession with the request headers
    const sessionResult = await neonAuth.getSession({
      fetchOptions: { headers: Object.fromEntries(req.headers) },
    });

    const userId = sessionResult?.data?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessName, businessType, waNumber } = await req.json();
    if (!businessName || !businessType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.business.findFirst({ where: { userId } });
    if (existing) {
      return NextResponse.json({ business: existing });
    }

    const business = await prisma.business.create({
      data: {
        name: businessName,
        type: businessType,
        waNumber: waNumber || null,
        userId,
      },
    });

    return NextResponse.json({ business });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
