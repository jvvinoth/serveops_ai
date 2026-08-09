import Link from "next/link";
import { Bot, ArrowRight, MessageSquare, DollarSign, Package, Calendar, Megaphone, Phone, CheckCircle, Clock } from "lucide-react";

export const metadata = {
  title: "Demo — ServeOps AI",
  description: "See how ServeOps AI handles 4 real SME scenarios.",
};

const SCENARIOS = [
  {
    id: "catering",
    tag: "Scenario 1",
    title: "40-Pax Catering Inquiry",
    message: "Hi! Can you cater lunch for 40 pax this Friday at our Raffles Place office? We need a mix of halal and non-halal options.",
    from: "David Tan · Tech Corp SG",
    urgency: "HIGH",
    value: "SGD 480",
    agents: [
      {
        name: "Sales",
        icon: DollarSign,
        color: "text-blue-400",
        action: "Draft quote",
        output: "Quote: 40× Nasi Lemak Set + 40× Chicken Rice Set = SGD 480. Delivery: Raffles Place. Needs: delivery time + halal qty split.",
      },
      {
        name: "Ops",
        icon: Package,
        color: "text-orange-400",
        action: "Check stock & staff",
        output: "Chicken stock at 8kg — borderline for 40 pax. Need to order 5kg more. Friday has 3 staff scheduled — need 1 extra for delivery.",
      },
      {
        name: "Admin",
        icon: Calendar,
        color: "text-purple-400",
        action: "Create prep tasks",
        output: "Tasks: Confirm halal count (Thu 5PM), Order extra chicken (Wed), Brief delivery driver (Fri 9AM), Prep containers (Fri 10AM).",
      },
      {
        name: "Call",
        icon: Phone,
        color: "text-green-400",
        action: "Write call script",
        output: "Call David: Confirm delivery time, dietary split (halal vs non-halal ratio), exact office floor, parking/loading bay access.",
      },
    ],
    outcome: "Owner approves quote → WhatsApp reply sent with quote PDF. 4 prep tasks created. Stock alert raised for chicken.",
  },
  {
    id: "supplier",
    tag: "Scenario 2",
    title: "Supplier Stock Alert",
    message: "Hi, chicken delivery delayed to tomorrow — short on stock today. Want to switch to pork for today's menu?",
    from: "Supplier Lim · Lim Fresh Poultry",
    urgency: "HIGH",
    value: "Ops Risk",
    agents: [
      {
        name: "Ops",
        icon: Package,
        color: "text-orange-400",
        action: "Check impact",
        output: "4 menu items affected. 2 confirmed bookings today use chicken. Alternative: pork belly available from Tan Brothers.",
      },
      {
        name: "Admin",
        icon: Calendar,
        color: "text-purple-400",
        action: "Create tasks",
        output: "Tasks: Contact Tan Brothers for emergency pork order, Update today's menu board, Brief kitchen staff by 8AM.",
      },
      {
        name: "Sales",
        icon: DollarSign,
        color: "text-blue-400",
        action: "Draft customer reply",
        output: "Message to affected customers: Today's menu features premium pork options. Offer 10% discount for inconvenience.",
      },
      {
        name: "Marketing",
        icon: Megaphone,
        color: "text-pink-400",
        action: "Update promo",
        output: "WhatsApp broadcast: Today's special — Braised Pork Bento at SGD 9.50. Quote 'SURPRISE' for free drink.",
      },
    ],
    outcome: "Owner approves ops response + customer message. Broadcast sent. Staff briefed via task list.",
  },
  {
    id: "complaint",
    tag: "Scenario 3",
    title: "Customer Complaint",
    message: "Hi, ordered nasi lemak yesterday for delivery but it arrived cold and rice was hard. Very disappointed.",
    from: "Sarah Lim · Regular Customer",
    urgency: "MEDIUM",
    value: "Retention",
    agents: [
      {
        name: "Sales",
        icon: DollarSign,
        color: "text-blue-400",
        action: "Draft apology + recovery offer",
        output: "Apology message + 1× free nasi lemak voucher + free delivery on next order. Recovery offer worth SGD 7.",
      },
      {
        name: "Admin",
        icon: Calendar,
        color: "text-purple-400",
        action: "Log complaint task",
        output: "Task: Check delivery driver's route time yesterday. Review packaging for cold-prevention. Flag to kitchen.",
      },
      {
        name: "Marketing",
        icon: Megaphone,
        color: "text-pink-400",
        action: "Review response",
        output: "If Google review is posted: professional response acknowledging issue, highlighting improvement steps.",
      },
    ],
    outcome: "Owner approves apology + voucher. Customer retained. Internal task created to investigate delivery SLA.",
  },
  {
    id: "promo",
    tag: "Scenario 4",
    title: "Slow Day — Need a Promo",
    message: "It's Tuesday 10AM and the lunch crowd looks thin today.",
    from: "Owner note — internal",
    urgency: "LOW",
    value: "Revenue Boost",
    agents: [
      {
        name: "Marketing",
        icon: Megaphone,
        color: "text-pink-400",
        action: "Draft broadcast",
        output: "WhatsApp blast to 48 regulars: 'Lunch Special today only — any set + drink for SGD 10.50 (save SGD 2). Reply to order. Until 1PM.'",
      },
      {
        name: "Sales",
        icon: DollarSign,
        color: "text-blue-400",
        action: "Identify upsell",
        output: "3 customers bought only rice last week — suggest combo upgrades in next reply.",
      },
      {
        name: "Ops",
        icon: Package,
        color: "text-orange-400",
        action: "Check promo feasibility",
        output: "All items in stock. Staff capacity OK for 20+ extra orders. Estimated promo prep time: 15 min.",
      },
    ],
    outcome: "Owner approves broadcast → sent to 48 customers. 12 orders received in 30 min.",
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-bold text-white">ServeOps AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Home</Link>
          <Link href="/app" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5">
            Try Demo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">4 Real Scenarios</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">See ServeOps AI in Action</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Each scenario shows a real message, how the AI agents respond,
            and what the owner approves.
          </p>
        </div>

        <div className="space-y-10">
          {SCENARIOS.map((scenario) => (
            <div key={scenario.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-slate-800/60 px-6 py-4 border-b border-slate-700 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">{scenario.tag}</div>
                  <h2 className="text-lg font-bold text-white">{scenario.title}</h2>
                  <p className="text-sm text-slate-400 mt-0.5">{scenario.from}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    scenario.urgency === "HIGH"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : scenario.urgency === "MEDIUM"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-slate-700 text-slate-400 border-slate-600"
                  }`}>
                    {scenario.urgency}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-medium">
                    {scenario.value}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Incoming message */}
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Inbound Message
                  </div>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200 leading-relaxed italic">
                    &ldquo;{scenario.message}&rdquo;
                  </div>
                </div>

                {/* Agent responses */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-emerald-400" /> AI Agents Respond
                    </div>
                    <div className="flex-1 h-px bg-slate-800" />
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Clock className="w-3 h-3" /> ~3 sec
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {scenario.agents.map((agent) => {
                      const Icon = agent.icon;
                      return (
                        <div key={agent.name} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 grid md:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 flex-shrink-0 ${agent.color}`} />
                            <div>
                              <div className="text-xs font-semibold text-white">{agent.name} Agent</div>
                              <div className="text-xs text-slate-500">{agent.action}</div>
                            </div>
                          </div>
                          <div className="md:col-span-3 text-xs text-slate-300 leading-relaxed">
                            {agent.output}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Outcome */}
                <div className="flex items-start gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-emerald-300 mb-0.5">After Owner Approves</div>
                    <div className="text-xs text-slate-300 leading-relaxed">{scenario.outcome}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <div className="text-slate-400 text-sm mb-5">Ready to see this with real data?</div>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors"
          >
            Open Live Demo <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-slate-600 mt-3">Go to Command Center → click any scenario button → watch agents work</p>
        </div>
      </div>
    </main>
  );
}
