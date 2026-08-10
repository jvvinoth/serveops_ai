import { Bot } from "lucide-react";
import { SignUpForm } from "../AuthViewClient";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
          <Bot className="w-6 h-6 text-green-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">ServeOps AI</h1>
          <p className="text-slate-400 text-sm mt-1">Set up your AI team in 2 minutes</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Create your account</h2>
          <p className="text-slate-400 text-sm mt-1">Start your free 14-day trial</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
