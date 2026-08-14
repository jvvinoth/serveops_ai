# ServeOps Live Call Agent

This is the Warmline call architecture adapted into ServeOps AI.

## What It Does

1. Owner clicks `Start Live Call Agent` on a generated call deliverable.
2. ServeOps creates a LiveKit room through `/api/calls/start`.
3. The room metadata includes the customer, WhatsApp enquiry, selected service, price, payment terms, and appointment slots.
4. The Python voice worker joins the room, speaks to the customer, and calls `book_appointment` when the customer agrees to a time.
5. `/api/calls/book` writes the appointment outcome back as a pending approval item.

## Required Env

Add these to `.env.local`:

```bash
LIVEKIT_URL="wss://your-project.livekit.cloud"
LIVEKIT_API_KEY="..."
LIVEKIT_API_SECRET="..."
DEEPGRAM_API_KEY="..."
ELEVENLABS_API_KEY="..."
OPENROUTER_API_KEY="..."
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
OPENROUTER_MODEL="anthropic/claude-haiku-4.5"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For a local demo, `NEXT_PUBLIC_APP_URL` must be reachable by the voice worker. If the worker runs on the same machine, `http://localhost:3000` is fine.

## Run Locally

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
cd voice
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python serveops_agent.py dev
```

Then open the Live Demo, generate a call deliverable, and click `Start Live Call Agent`.

## Demo Safety

If the LiveKit env keys are missing, the UI shows a clear setup notice and a transcript fallback. The main WhatsApp, proposal, invoice, and approval demo still works.
