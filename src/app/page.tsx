import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-sm">S</div>
          <span className="font-semibold text-lg">ServeOps AI</span>
        </div>
        <Link
          href="/app"
          className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Open Dashboard →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 text-emerald-400 text-sm mb-6">
          Business Agent · AIT x Tencent Hackathon 2026
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Your AI Operating Team
          <br />
          <span className="text-emerald-400">for SMEs</span>
        </h1>
        <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
          Turns WhatsApp orders into business actions — quotes, ops checks, tasks, and call scripts. All in seconds. All approval-first.
        </p>
        <p className="text-slate-400 mb-10">
          Built for F&B, tuition, clinics, salons, and any business that runs on WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/app"
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors"
          >
            Try Live Demo
          </Link>
          <Link
            href="/demo"
            className="border border-white/20 hover:border-white/40 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors"
          >
            Watch How It Works
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">From WhatsApp to Action in 3 Steps</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Message Received",
              desc: "Customer sends catering inquiry, order, or question via WhatsApp.",
              color: "bg-blue-500/20 border-blue-500/30 text-blue-400",
            },
            {
              step: "02",
              title: "AI Agents Analyse",
              desc: "Sales, Ops, Admin, and Call agents work in parallel — checking stock, drafting quotes, scheduling tasks.",
              color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
            },
            {
              step: "03",
              title: "Owner Approves",
              desc: "You see a queue of recommended actions. One tap to approve, edit, or reject each one.",
              color: "bg-purple-500/20 border-purple-500/30 text-purple-400",
            },
          ].map((item) => (
            <div key={item.step} className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border text-sm font-bold mb-4 ${item.color}`}>
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agents */}
      <section className="max-w-5xl mx-auto px-8 py-8 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">5 AI Agents, 1 Platform</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "Sales Agent", desc: "Quotes & pricing", emoji: "💰" },
            { name: "Ops Agent", desc: "Stock & staff", emoji: "⚙️" },
            { name: "Admin Agent", desc: "Tasks & calendar", emoji: "📋" },
            { name: "Marketing Agent", desc: "Reviews & promos", emoji: "📣" },
            { name: "Call Agent", desc: "Call scripts", emoji: "📞" },
          ].map((agent) => (
            <div key={agent.name} className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-2xl mb-2">{agent.emoji}</div>
              <div className="font-medium text-sm">{agent.name}</div>
              <div className="text-slate-400 text-xs mt-1">{agent.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-slate-500 text-sm border-t border-white/5">
        ServeOps AI · Built with CodeBuddy · AIT x Tencent Hackathon Singapore 2026
      </footer>
    </main>
  );
}
