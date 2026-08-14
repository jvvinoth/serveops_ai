# ServeOps AI — AI Operating Team for SMEs

> One WhatsApp message. Six AI agents. Business deliverables in under 2 minutes.

ServeOps AI is a multi-agent AI platform that turns inbound WhatsApp customer messages into professional quotes, proposal decks, invoices, call scripts, tasks, and marketing copy — all routed through an owner approval gate before any action is taken.

Built for the **CodeBuddy Hackathon 2026** using Next.js, Neon Postgres, OpenRouter, and LiveKit.

🌐 **Live Demo:** [serveopsai-production.up.railway.app](https://serveopsai-production.up.railway.app)
📐 **Architecture:** [/architecture](https://serveopsai-production.up.railway.app/architecture)

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [How It Works](#how-it-works)
- [AI Agents](#ai-agents)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Routes](#routes)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

---

## Overview

SME owners run their business on WhatsApp. Every day they manually:
- Type out quotes and proposals from scratch
- Chase leads that go cold because follow-ups are forgotten
- Spend hours on admin instead of serving customers

ServeOps AI solves this by sitting between the WhatsApp message and the owner's response — a team of 6 AI agents that work in parallel and surface ready-to-approve business outputs in seconds.

---

## The Problem

| Pain Point | Impact |
|---|---|
| Customer inquiries replied hours late | Lost leads |
| Quotes and proposals typed manually | Wasted time |
| Follow-ups forgotten | Cold leads |
| Owner buried in admin | No growth |
| No professional proposal | Lost deals to bigger competitors |

---

## How It Works

```
Customer WhatsApp Message
        ↓
Meta WhatsApp Business Cloud API
        ↓
Next.js API  (/api/messages/inbound)
        ↓
Router Agent  → classifies intent, urgency, value, missing info
        ↓
┌──────────────────────────────────────────────┐
│  6 Agents running in parallel (Promise.all)  │
│  Sales · Proposal · Invoice · Call · Admin · Marketing │
└──────────────────────────────────────────────┘
        ↓
Approval Queue  → owner reviews every output
        ↓
Business Action  → send / store / alert
```

---

## AI Agents

| Agent | Role | Output |
|---|---|---|
| **Router Agent** | Classifies intent, urgency, value, customer type | `routerOutput` JSON |
| **Sales Agent** | Qualifies lead, drafts quote + WhatsApp reply | `ApprovalItem: quote, reply` |
| **Proposal Agent** | Generates 6-slide pitch deck for the prospect | `ApprovalItem: proposal` |
| **Invoice Agent** | Creates itemised invoice with deposit + payment terms | `ApprovalItem: invoice` |
| **Call Agent** | Writes call script + recommends appointment slots | `ApprovalItem: call_script` |
| **Admin Agent** | Creates tasks, reminders, calendar blocks | `ApprovalItem: tasks` |
| **Marketing Agent** | Drafts promos, review responses, broadcast copy | `ApprovalItem: promo` |

All agent outputs are held in the **Approval Queue** — nothing is sent until the business owner explicitly approves.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16.3 App Router · TypeScript · Tailwind CSS v4 · shadcn/ui |
| **AI Pipeline** | Custom 6-agent orchestration · OpenRouter API |
| **LLM** | OpenRouter (Claude / GPT-4o / Mistral — switchable) |
| **Database** | Neon Postgres (serverless) · Prisma v7 ORM |
| **WhatsApp** | Meta WhatsApp Business Cloud API |
| **Voice Agent** | LiveKit · Deepgram STT · ElevenLabs TTS |
| **Auth** | NeonDB Auth (demo: single-tenant) |
| **Deployment** | Railway (Nixpacks) |

---

## Project Structure

```
serveops_ai/
├── prisma/
│   ├── schema.prisma          # 14-model Postgres schema
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── ai/
│   │   ├── pipeline.ts        # Core multi-agent orchestration
│   │   └── prompts/           # Markdown prompt files per agent
│   │       ├── router.md
│   │       ├── sales-agent.md
│   │       ├── proposal-agent.md
│   │       ├── invoice-agent.md
│   │       ├── call-agent.md
│   │       ├── admin-agent.md
│   │       └── marketing-agent.md
│   └── app/
│       ├── page.tsx            # Landing page
│       ├── architecture/       # /architecture — tech overview page
│       ├── pitch/              # /pitch — hackathon pitch deck
│       ├── app/                # Main app (authenticated)
│       │   ├── page.tsx        # Command Center (demo scenarios)
│       │   ├── inbox/          # Approval queue + agent outputs
│       │   ├── proposals/      # Proposal deck viewer
│       │   ├── invoices/       # Invoice manager
│       │   ├── tasks/          # Task list
│       │   └── NavLinks.tsx
│       └── api/
│           ├── messages/       # Inbound WhatsApp webhook
│           ├── approvals/      # Approval queue CRUD
│           ├── scenarios/      # Demo scenario loader
│           ├── calls/          # LiveKit voice agent
│           └── ...
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.9.0
- A [Neon](https://neon.tech) Postgres database
- An [OpenRouter](https://openrouter.ai) API key

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/jvvinoth/serveops_ai.git
cd serveops_ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your values — see Environment Variables section below

# 4. Push the database schema
npm run db:push

# 5. Seed demo data
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.
Open [http://localhost:3000/app](http://localhost:3000/app) for the Command Center.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# LLM (OpenRouter)
OPENROUTER_API_KEY="sk-or-..."
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
OPENROUTER_MODEL="openai/gpt-4o-mini"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEMO_MODE="true"

# Voice Agent — LiveKit + Deepgram + ElevenLabs
LIVEKIT_URL="wss://your-project.livekit.cloud"
LIVEKIT_API_KEY=""
LIVEKIT_API_SECRET=""
DEEPGRAM_API_KEY=""
ELEVENLABS_API_KEY=""

# WhatsApp — Meta Business Cloud API
META_WHATSAPP_TOKEN=""
META_WHATSAPP_PHONE_NUMBER_ID=""
META_WEBHOOK_VERIFY_TOKEN=""
```

> **Demo mode:** Set `NEXT_PUBLIC_DEMO_MODE=true` to use the built-in WhatsApp simulator without a real Meta API connection.

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # prisma generate + next build
npm run start        # Start production server
npm run lint         # ESLint

npm run db:push      # Push Prisma schema to Neon DB
npm run db:seed      # Seed demo business + conversations
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run db:generate  # Regenerate Prisma client
```

---

## Routes

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/architecture` | Technical architecture overview |
| `/pitch` | Hackathon pitch deck |
| `/app` | Command Center — demo scenario launcher |
| `/app/inbox` | Approval queue — review agent outputs |
| `/app/proposals` | Proposal deck viewer |
| `/app/invoices` | Invoice manager |
| `/app/tasks` | Task list |
| `/app/connect` | WhatsApp connection setup |
| `/api/messages/inbound` | WhatsApp webhook endpoint |
| `/api/approvals` | Approval queue API |
| `/api/scenarios` | Demo scenario loader |
| `/api/calls` | LiveKit voice agent token |

---

## Database Schema

14 Prisma models on Neon Postgres:

| Model | Purpose |
|---|---|
| `Business` | Core tenant entity |
| `Conversation` | WhatsApp thread per customer |
| `Message` | Inbound / outbound messages |
| `AgentRun` | Pipeline execution record per message |
| `ApprovalItem` | Pending agent outputs awaiting owner approval |
| `Task` | Generated to-do items |
| `Proposal` | Pitch deck drafts |
| `Invoice` | Itemised invoice records |
| `Customer` | Customer profiles + history |
| `Quote` | Approved quote records |
| `Booking` | Confirmed orders / events |
| `Product` | Product / service catalog |
| `Staff` | Staff directory |
| `AuditLog` | Full action trail |

---

## Deployment

The project is deployed on **Railway** via Nixpacks (auto-detected Next.js build).

### Deploy your own

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Fork this repo
2. Create a new Railway project and connect your fork
3. Add all environment variables from `.env.example`
4. Railway will auto-deploy on every push to `main`

> The `build` script runs `prisma generate` before `next build` — no manual step needed.

---

## Built With CodeBuddy

This project was built end-to-end using **[CodeBuddy](https://www.codebuddy.ai)** — AI-assisted development from architecture design to deployment.

---

## License

MIT
