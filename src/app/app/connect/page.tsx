"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Smartphone,
  RefreshCw,
  QrCode,
  Wifi,
  Play,
  Shield,
  Zap,
  Link2,
} from "lucide-react";

interface WaStatus {
  connected: boolean;
  status?: string;
  configured: boolean;
  phoneNumber?: string;
  pushName?: string;
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
        setStartMsg("Generating QR code...");
        setTimeout(() => refresh(), 2000);
      } else {
        setStartMsg("Connection failed. Please try again.");
      }
    } catch {
      setStartMsg("Unable to connect. Please try again.");
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
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">WhatsApp Business</h1>
            <p className="text-slate-400 text-sm">Connect your business number to ServeOps AI</p>
          </div>
        </div>
      </div>

      {/* Connected state */}
      {isConnected && (
        <div className="bg-green-900/20 border border-green-700 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-10 h-10 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-white text-lg">WhatsApp Connected</div>
              <div className="text-green-400 mt-0.5 text-sm">
                {status?.pushName && <span className="font-medium">{status.pushName} · </span>}
                {status?.phoneNumber}
              </div>
              <div className="text-slate-400 text-xs mt-1">
                ServeOps AI is now listening for incoming messages on this number.
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors flex-shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* QR scan state */}
      {!isConnected && isConfigured && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Scan to Connect</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Link your WhatsApp number by scanning the QR code below
                </p>
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

          <div className="p-6 flex flex-col items-center">
            {loading ? (
              <div className="w-56 h-56 bg-slate-700 rounded-2xl animate-pulse" />
            ) : qr ? (
              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <img src={qr} alt="WhatsApp QR Code" className="w-52 h-52 block" />
              </div>
            ) : (
              <div className="w-56 h-56 bg-slate-900 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-700 mb-4">
                <QrCode className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 text-center px-6">QR code will appear here</p>
              </div>
            )}

            <div className="mt-5 w-full max-w-xs">
              <h3 className="text-sm font-semibold text-white mb-3 text-center">How to connect</h3>
              <ol className="space-y-2.5">
                {[
                  "Open WhatsApp on your phone",
                  "Go to Settings → Linked Devices",
                  "Tap "Link a Device"",
                  "Scan the QR code above",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <button
                onClick={startSession}
                disabled={starting}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" />
                {starting ? "Connecting..." : "Generate New QR Code"}
              </button>
              {startMsg && (
                <p className="text-xs text-slate-400 mt-2 text-center">{startMsg}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Not configured */}
      {!isConfigured && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-white text-sm">Connect WhatsApp Business</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Click below to generate a QR code and link your WhatsApp Business number.
          </p>
          <button
            onClick={startSession}
            disabled={starting}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Play className="w-4 h-4" />
            {starting ? "Connecting..." : "Connect WhatsApp"}
          </button>
          {startMsg && <p className="text-xs text-slate-400 mt-2">{startMsg}</p>}
        </div>
      )}

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            icon: Zap,
            title: "Instant routing",
            desc: "Messages classified by AI in seconds",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            icon: Shield,
            title: "Owner approval",
            desc: "Every AI action needs your sign-off",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            icon: Wifi,
            title: "Always-on",
            desc: "24/7 monitoring, even when you sleep",
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <div
            key={title}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center"
          >
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-xs font-semibold text-white mb-1">{title}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>

      {/* Demo fallback */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1.5">
          <Play className="w-3.5 h-3.5 text-green-400" />
          No WhatsApp? Use Demo Mode
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Go to{" "}
          <a href="/app" className="text-green-400 hover:text-green-300 underline">
            Command Center
          </a>{" "}
          and run any demo scenario — it simulates a real WhatsApp message and triggers the full AI
          agent pipeline end-to-end.
        </p>
      </div>
    </div>
  );
}
