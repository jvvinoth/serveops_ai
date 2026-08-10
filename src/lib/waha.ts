// WAHA WhatsApp connector
// Docs: https://waha.devlike.pro/

export interface WAHAStatus {
  connected: boolean;
  status?: string;
  phoneNumber?: string;
  pushName?: string;
  session?: string;
}

function getWAHAURL() {
  return process.env.WAHA_URL || process.env.WAHA_API_URL || "";
}

function getWAHASession() {
  return process.env.WAHA_SESSION_NAME || "default";
}

function wahaHeaders() {
  const key = process.env.WAHA_API_KEY || "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (key) headers["X-Api-Key"] = key;
  return headers;
}

export async function getWAHAStatus(): Promise<WAHAStatus> {
  const WAHA_URL = getWAHAURL();
  const WAHA_SESSION = getWAHASession();
  if (!WAHA_URL) return { connected: false };

  try {
    const res = await fetch(`${WAHA_URL}/api/sessions/${WAHA_SESSION}`, {
      headers: wahaHeaders(),
    });
    if (!res.ok) return { connected: false, status: "NOT_FOUND" };

    const data = await res.json();
    return {
      connected: data.status === "WORKING",
      status: data.status,
      phoneNumber: data.me?.id,
      pushName: data.me?.pushName,
      session: data.name,
    };
  } catch {
    return { connected: false };
  }
}

export async function getWAHAQRCode(): Promise<string | null> {
  const WAHA_URL = getWAHAURL();
  const WAHA_SESSION = getWAHASession();
  if (!WAHA_URL) return null;

  try {
    // First ensure session exists
    await ensureSession();

    const res = await fetch(`${WAHA_URL}/api/${WAHA_SESSION}/auth/qr`, {
      headers: wahaHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();

    // WAHA returns { mimetype, value } where value is base64
    if (data.mimetype && data.value) {
      return `data:${data.mimetype};base64,${data.value}`;
    }
    // fallback: already a data URL or plain string
    return data.value || null;
  } catch {
    return null;
  }
}

async function ensureSession(): Promise<void> {
  const WAHA_URL = getWAHAURL();
  const WAHA_SESSION = getWAHASession();
  if (!WAHA_URL) return;

  try {
    // Check if session exists
    const check = await fetch(`${WAHA_URL}/api/sessions/${WAHA_SESSION}`, {
      headers: wahaHeaders(),
    });
    if (check.ok) return; // already exists

    // Create session with webhook
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const body: Record<string, unknown> = { name: WAHA_SESSION };
    if (appUrl) {
      body.webhooks = [
        {
          url: `${appUrl}/api/wa/webhook`,
          events: ["message"],
        },
      ];
    }
    await fetch(`${WAHA_URL}/api/sessions`, {
      method: "POST",
      headers: wahaHeaders(),
      body: JSON.stringify(body),
    });
  } catch {}
}

export async function startWAHASession(): Promise<boolean> {
  const WAHA_URL = getWAHAURL();
  const WAHA_SESSION = getWAHASession();
  if (!WAHA_URL) return false;

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const body: Record<string, unknown> = { name: WAHA_SESSION };
    if (appUrl) {
      body.webhooks = [
        {
          url: `${appUrl}/api/wa/webhook`,
          events: ["message"],
        },
      ];
    }
    const res = await fetch(`${WAHA_URL}/api/sessions`, {
      method: "POST",
      headers: wahaHeaders(),
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendWAHAMessage(to: string, body: string): Promise<boolean> {
  const WAHA_URL = getWAHAURL();
  const WAHA_SESSION = getWAHASession();
  if (!WAHA_URL) return false;

  try {
    const res = await fetch(`${WAHA_URL}/api/sendText`, {
      method: "POST",
      headers: wahaHeaders(),
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId: to.includes("@") ? to : `${to}@c.us`,
        text: body,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const isWAHAConfigured = () => Boolean(getWAHAURL());
