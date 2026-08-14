"""ServeOps voice agent worker.

This adapts the Warmline LiveKit agent pattern for ServeOps AI:
WhatsApp inquiry -> owner-approved call -> AI voice confirms details -> booking outcome
is posted back into the ServeOps approval queue.
"""

import json
import logging
import os

import aiohttp
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, function_tool
from livekit.plugins import deepgram, elevenlabs, openai, silero

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("serveops-voice-agent")


def _metadata(ctx: agents.JobContext) -> dict:
    try:
        return json.loads(ctx.room.metadata or "{}")
    except Exception as exc:
        logger.warning("invalid room metadata: %s", exc)
        return {}


def build_instructions(md: dict) -> str:
    customer = md.get("customer_name", "there")
    owner_business = md.get("owner_business", "the business")
    industry = md.get("industry", "SME business")
    service_name = md.get("service_name", "the requested service")
    service_price = md.get("service_price_sgd")
    offer_summary = md.get("offer_summary", "")
    availability = md.get("availability", "tomorrow afternoon or the next available weekday morning")
    payment_terms = md.get("payment_terms", "payment details will be sent after owner approval")
    call_goal = md.get("call_goal", "confirm the customer request and book the next step")
    latest_message = md.get("latest_whatsapp_message", "")
    script_opening = md.get("script_opening", "")
    script_closing = md.get("script_closing", "")
    key_points = md.get("key_points", [])
    voice = md.get("brand_voice", "warm, concise, professional")

    price_line = (
        f"The configured service price is SGD {service_price}."
        if service_price
        else "Do not invent pricing. Say the owner will confirm final pricing if needed."
    )
    key_point_lines = "\n".join(f"- {point}" for point in key_points[:5])

    return f"""You are ServeOps AI's Call Agent calling on behalf of {owner_business}.
You are speaking to {customer}. This is a live phone call, so keep every turn short and natural.

Business context:
- Business: {owner_business}
- Industry: {industry}
- Service/package: {service_name}
- Offer summary: {offer_summary}
- Payment terms: {payment_terms}
- Brand voice: {voice}
- Original WhatsApp message: {latest_message}
- Call goal: {call_goal}
- Available slots: {availability}
- Pricing rule: {price_line}

Generated call script opening, if useful:
{script_opening}

Key points to cover:
{key_point_lines or "- Confirm the customer's need.\n- Explain the next step.\n- Offer an appointment slot.\n- Confirm owner approval before anything final is sent."}

Generated closing, if useful:
{script_closing}

FLOW:
1. Greet {customer}; say you are calling from {owner_business} about their WhatsApp enquiry.
2. Confirm the request in one sentence.
3. Answer only using the context above. If unsure, say the owner will confirm in writing.
4. Offer the available slots. Ask which one works.
5. The moment the customer agrees to a slot, call `book_appointment`.
6. Confirm that the details will be sent on WhatsApp for owner-approved final confirmation.
7. End politely.

RULES:
- Never say you are human.
- Never make promises outside the context.
- Never pressure the customer.
- Do not invent discounts or unavailable dates.
- Keep answers to 1-2 short sentences.
- If the customer asks for final invoice/proposal details, say it is already drafted and will be sent after owner approval."""


class ServeOpsCallAgent(Agent):
    def __init__(self, instructions: str, md: dict):
        super().__init__(instructions=instructions)
        self._md = md

    @function_tool()
    async def book_appointment(self, when: str, notes: str = "") -> str:
        """Record a booked appointment once the customer agrees to a time.

        Args:
            when: The agreed appointment day/time in plain words.
            notes: Any extra customer context from the call.
        """
        callback_url = self._md.get("callback_url")
        approval_item_id = self._md.get("approval_item_id")
        if not callback_url or not approval_item_id:
            return f"Booked for {when}. The owner will confirm the details on WhatsApp."

        payload = {
            "approval_item_id": approval_item_id,
            "when": when,
            "notes": notes,
            "transcript_summary": f"Customer agreed to {when}. {notes}".strip(),
        }
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    callback_url,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=10),
                )
        except Exception as exc:
            logger.warning("book_appointment callback failed: %s", exc)

        return f"Booked for {when}. The owner will send the final confirmation on WhatsApp."


async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()
    md = _metadata(ctx)
    logger.info("ServeOps call starting room=%s customer=%s", ctx.room.name, md.get("customer_name"))

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-2", language="en"),
        llm=openai.LLM(
            model=os.getenv("OPENROUTER_MODEL", "anthropic/claude-haiku-4.5"),
            base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
            api_key=os.getenv("OPENROUTER_API_KEY"),
        ),
        tts=elevenlabs.TTS(),
    )

    await session.start(agent=ServeOpsCallAgent(build_instructions(md), md), room=ctx.room)
    await session.generate_reply(
        instructions="Start the call warmly and follow your instructions. Mention the customer's WhatsApp enquiry."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
