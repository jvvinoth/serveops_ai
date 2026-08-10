"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, ChefHat, ShoppingBag, Scissors, Coffee, ArrowRight, Loader2 } from "lucide-react";

const BUSINESS_TYPES = [
  { id: "fnb", label: "Food & Beverage", icon: ChefHat, desc: "Restaurant, café, catering, hawker" },
  { id: "retail", label: "Retail", icon: ShoppingBag, desc: "Shop, grocery, boutique" },
  { id: "services", label: "Services", icon: Scissors, desc: "Salon, laundry, repair, tuition" },
  { id: "cafe", label: "Café / Kiosk", icon: Coffee, desc: "Coffee, bubble tea, snacks" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    waNumber: "",
  });

  const handleSubmit = async () => {
    if (!form.businessName || !form.businessType) return;
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/app");
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
          <Bot className="w-6 h-6 text-green-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Set up your business</h1>
          <p className="text-slate-400 text-sm mt-1">Takes 60 seconds. Your AI team is ready after this.</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= s ? "bg-green-500 text-white" : "bg-slate-800 text-slate-500"
            }`}>{s}</div>
            {s < 2 && <div className={`w-10 h-0.5 ${step > s ? "bg-green-500" : "bg-slate-800"}`} />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-6">

        {/* Step 1 — Business name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">What&apos;s your business name?</h2>
              <p className="text-slate-400 text-sm">This is how you&apos;ll be identified in ServeOps.</p>
            </div>
            <input
              autoFocus
              type="text"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="e.g. Kopi & Bowl Café"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && form.businessName && setStep(2)}
            />
            <button
              onClick={() => setStep(2)}
              disabled={!form.businessName.trim()}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 — Business type + WhatsApp */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">What type of business?</h2>
              <p className="text-slate-400 text-sm">ServeOps tailors the AI agents to your industry.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setForm({ ...form, businessType: type.id })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.businessType === type.id
                      ? "border-green-500 bg-green-500/10"
                      : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <type.icon className={`w-5 h-5 mb-2 ${form.businessType === type.id ? "text-green-400" : "text-slate-400"}`} />
                  <div className={`text-sm font-semibold ${form.businessType === type.id ? "text-white" : "text-slate-300"}`}>{type.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{type.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">WhatsApp number <span className="text-slate-600">(optional)</span></label>
              <input
                type="tel"
                value={form.waNumber}
                onChange={(e) => setForm({ ...form, waNumber: e.target.value })}
                placeholder="+65 9123 4567"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
              />
              <p className="text-xs text-slate-600 mt-1">You can connect WhatsApp later from Settings.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-sm transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.businessType || loading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bot className="w-4 h-4" /> Launch my AI team</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
