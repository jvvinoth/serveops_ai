import { Bot } from "lucide-react";
import AuthViewClient from "../AuthViewClient";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
          <Bot className="w-6 h-6 text-green-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">ServeOps AI</h1>
          <p className="text-slate-400 text-sm mt-1">AI Operating Team for SMEs</p>
        </div>
      </div>
      <div className="w-full max-w-sm">
        <AuthViewClient path="SIGN_IN" />
      </div>
    </div>
  );
}
