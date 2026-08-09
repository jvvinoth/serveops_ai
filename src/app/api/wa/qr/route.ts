import { NextRequest, NextResponse } from "next/server";
import { getWAHAQRCode, isWAHAConfigured } from "@/lib/waha";

// GET /api/wa/qr
export async function GET() {
  if (!isWAHAConfigured()) {
    return NextResponse.json({ error: "WAHA not configured" }, { status: 400 });
  }
  const qr = await getWAHAQRCode();
  return NextResponse.json({ qr });
}
