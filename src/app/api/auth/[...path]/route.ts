import { neonAuth } from "@/lib/auth/server";
import { NextResponse, type NextRequest } from "next/server";

function authConfigured() {
  return Boolean(
    (process.env.NEON_AUTH_URL || process.env.NEON_AUTH_BASE_URL) &&
      (process.env.AUTH_COOKIE_SECRET || process.env.NEON_AUTH_COOKIE_SECRET)
  );
}

function unavailable() {
  return NextResponse.json(
    { error: "Auth is disabled for this demo environment." },
    { status: 503 }
  );
}

function handlers() {
  return neonAuth.handler();
}

type AuthRouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: AuthRouteContext) {
  if (!authConfigured()) return unavailable();
  return handlers().GET(req, context);
}

export async function POST(req: NextRequest, context: AuthRouteContext) {
  if (!authConfigured()) return unavailable();
  return handlers().POST(req, context);
}

export async function PUT(req: NextRequest, context: AuthRouteContext) {
  if (!authConfigured()) return unavailable();
  return handlers().PUT(req, context);
}

export async function DELETE(req: NextRequest, context: AuthRouteContext) {
  if (!authConfigured()) return unavailable();
  return handlers().DELETE(req, context);
}

export async function PATCH(req: NextRequest, context: AuthRouteContext) {
  if (!authConfigured()) return unavailable();
  return handlers().PATCH(req, context);
}
