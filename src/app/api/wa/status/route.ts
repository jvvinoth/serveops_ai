import { NextRequest, NextResponse } from "next/server";
import { getWAHAStatus, getWAHAQRCode, startWAHASession, isWAHAConfigured } from "@/lib/waha";

// GET /api/wa/status
export async function GET() {
  if (!isWAHAConfigured()) {
    return NextResponse.json({ connected: false, configured: false });
  }
  const status = await getWAHAStatus();
  return NextResponse.json({ ...status, configured: true });
}

// POST /api/wa/start — start WAHA session
export async function POST() {
  if (!isWAHAConfigured()) {
    return NextResponse.json({ error: "WAHA not configured" }, { status: 400 });
  }
  const started = await startWAHASession();
  return NextResponse.json({ success: started });
}
