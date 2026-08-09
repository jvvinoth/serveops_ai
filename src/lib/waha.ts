// WAHA WhatsApp connector
// Docs: https://waha.devlike.pro/

export interface WAHAStatus {
  connected: boolean;
  phoneNumber?: string;
  qrCode?: string;
  session?: string;
}

const WAHA_URL = process.env.WAHA_API_URL || "";
const WAHA_SESSION = process.env.WAHA_SESSION_NAME || "serveops";
const WAHA_KEY = process.env.WAHA_API_KEY || "";

function wahaHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (WAHA_KEY) headers["X-Api-Key"] = WAHA_KEY;
  return headers;
}

export async function getWAHAStatus(): Promise<WAHAStatus> {
  if (!WAHA_URL) return { connected: false };

  try {
    const res = await fetch(`${WAHA_URL}/api/sessions/${WAHA_SESSION}`, {
      headers: wahaHeaders(),
    });
    if (!res.ok) return { connected: false };

    const data = await res.json();
    return {
      connected: data.status === "WORKING",
      phoneNumber: data.me?.id,
      session: data.name,
    };
  } catch {
    return { connected: false };
  }
}

export async function getWAHAQRCode(): Promise<string | null> {
  if (!WAHA_URL) return null;

  try {
    const res = await fetch(`${WAHA_URL}/api/${WAHA_SESSION}/auth/qr`, {
      headers: wahaHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.value || null;
  } catch {
    return null;
  }
}

export async function startWAHASession(): Promise<boolean> {
  if (!WAHA_URL) return false;

  try {
    const res = await fetch(`${WAHA_URL}/api/sessions/start`, {
      method: "POST",
      headers: wahaHeaders(),
      body: JSON.stringify({ name: WAHA_SESSION }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendWAHAMessage(to: string, body: string): Promise<boolean> {
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

export const isWAHAConfigured = () => Boolean(WAHA_URL);
