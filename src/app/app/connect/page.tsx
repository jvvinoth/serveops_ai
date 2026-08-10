"use client";
import { useEffect, useState } from "react";
import { CheckCircle, WifiOff, RefreshCw, QrCode, Wifi, Play } from "lucide-react";

interface WaStatus {
  connected: boolean;
  status?: string;
  configured: boolean;
  phoneNumber?: string;
  pushName?: string;
  session?: string;
}

export default function ConnectPage() {
  const [status, setStatus] = useState<WaStatus | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startMsg, setStartMsg] = useState("");

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/wa/status");
      if (res.ok) setStatus(await res.json());
    } catch {}
  };

  const loadQr = async () => {
    try {
      const res = await fetch("/api/wa/qr");
      if (res.ok) {
        const data = await res.json();
        setQr(data.qr || null);
      }
    } catch {}
  };

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStatus(), loadQr()]);
    setRefreshing(false);
  };

  const startSession = async () => {
    setStarting(true);
    setStartMsg("");
    try {
      const res = await fetch("/api/wa/status", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setStartMsg("Session started! Loading QR...");
        setTimeout(() => refresh(), 2000);
      } else {
        setStartMsg("Failed to start session. Check WAHA logs.");
      }
    } catch {
      setStartMsg("Error connecting to WAHA.");
    }
    setStarting(false);
  };

  useEffect(() => {
    Promise.all([loadStatus(), loadQr()]).finally(() => setLoading(false));
    const interval = setInterval(loadStatus, 6000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = status?.connected;
  const isConfigured = status?.configured;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">WhatsApp Connection</h1>
        <p className="text-slate-400 text-sm mt-1">Connect via WAHA · <span className="text-slate-500">waha-production-3fc1.up.railway.app</span></p>
      </div>

      {/* Status card */}
      <div className={`rounded-xl border p-5 mb-5 ${
        isConnected ? "bg-green-900/20 border-green-800" :
        isConfigured ? "bg-amber-900/20 border-amber-800" :
        "bg-slate-800 border-slate-700"
      }`}>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <CheckCircle className="w-9 h-9 text-green-400" />
          ) : (
            <WifiOff className={`w-9 h-9 ${isConfigured ? "text-amber-500" : "text-slate-500"}`} />
          )}
          <div className="flex-1">
            <div className="font-semibold text-white">
              {isConnected ? "Connected" : isConfigured ? `Session: ${status?.status || "STARTING"}` : "Not Configured"}
            </div>
            {isConnected && (
              <div className="text-sm text-green-400 mt-0.5">
                {status?.pushName && `${status.pushName} · `}{status?.phoneNumber}
              </div>
            )}
            {!isConnected && isConfigured && (
              <div className="text-sm text-amber-400/80 mt-0.5">WAHA connected — scan QR to link WhatsApp</div>
            )}
            {!isConfigured && (
              <div className="text-sm text-slate-400 mt-0.5">Set WAHA_URL env var in Railway</div>
            )}
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* QR Code section */}
      {!isConnected && isConfigured && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center mb-5">
          <h3 className="font-semibold text-white mb-1">Scan QR Code</h3>
          <p className="text-sm text-slate-400 mb-4">
            Open WhatsApp → Linked Devices → Link a Device
          </p>

          {loading ? (
            <div className="w-52 h-52 bg-slate-700 rounded-xl mx-auto animate-pulse" />
          ) : qr ? (
            <img
              src={qr}
              alt="WhatsApp QR"
              className="w-52 h-52 mx-auto rounded-xl bg-white p-2"
            />
          ) : (
            <div className="w-52 h-52 bg-slate-900 rounded-xl mx-auto flex flex-col items-center justify-center border border-slate-700 mb-4">
              <QrCode className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs text-slate-500 text-center px-4">No QR yet</p>
              <p className="text-xs text-slate-600 mt-1 text-center px-4">Start a session below</p>
            </div>
          )}

          <button
            onClick={startSession}
            disabled={starting}
            className="mt-4 flex items-center gap-2 mx-auto px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            {starting ? "Starting..." : "Start WhatsApp Session"}
          </button>
          {startMsg && <p className="text-xs text-slate-400 mt-2">{startMsg}</p>}
        </div>
      )}

      {/* Not configured — show setup steps */}
      {!isConfigured && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-4">
          <h3 className="font-semibold text-white mb-3 text-sm">Setup Required</h3>
          <ol className="space-y-2">
            {[
              "Add WAHA_URL=https://waha-production-3fc1.up.railway.app to ServeOps env vars",
              "Add NEXT_PUBLIC_APP_URL=https://serveopsai-production.up.railway.app to ServeOps env vars",
              "Redeploy ServeOps AI service",
              "Come back here and click 'Start WhatsApp Session'",
              "Scan the QR code with your phone's WhatsApp",
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-400">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-xs text-slate-300 flex items-center justify-center font-medium flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Demo fallback */}
      <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-4">
        <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
          <Wifi className="w-4 h-4" />
          Demo Mode Available
        </div>
        <p className="text-xs text-amber-300/70 leading-relaxed">
          No WhatsApp needed for the demo. Go to{" "}
          <a href="/app" className="underline">Command Center</a>{" "}
          and run any demo scenario — it simulates a WhatsApp message and triggers the full AI agent pipeline end-to-end.
        </p>
      </div>
    </div>
  );
}
