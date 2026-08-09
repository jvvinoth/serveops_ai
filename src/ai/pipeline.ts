import fs from "fs";
import path from "path";
import { callLLM } from "@/lib/llm";
import { prisma } from "@/lib/db";

function loadPrompt(name: string): string {
  const filePath = path.join(process.cwd(), "src/ai/prompts", `${name}.md`);
  return fs.readFileSync(filePath, "utf-8");
}

export interface RouterOutput {
  intent: string;
  urgency: string;
  estimatedValue: number;
  currency: string;
  summary: string;
  missingInfo: string[];
  agents: string[];
  notes: string;
}

async function runAgent(
  promptFile: string,
  messageBody: string,
  businessContext: string,
  routerOutput: RouterOutput
): Promise<object> {
  const systemPrompt = loadPrompt(promptFile);
  const userMessage = [
    `Customer message: "${messageBody}"`,
    `Business context:\n${businessContext}`,
    `Router analysis:\n${JSON.stringify(routerOutput, null, 2)}`,
  ].join("\n\n");
  const raw = await callLLM(systemPrompt, userMessage);
  return JSON.parse(raw);
}

export async function runRouter(
  messageBody: string,
  businessContext: string
): Promise<RouterOutput> {
  const systemPrompt = loadPrompt("router");
  const userMessage = `Customer message: "${messageBody}"\n\nBusiness context:\n${businessContext}`;
  const raw = await callLLM(systemPrompt, userMessage);
  return JSON.parse(raw) as RouterOutput;
}

export async function buildBusinessContext(businessId: string): Promise<string> {
  const [menuItems, inventory, staffShifts, suppliers] = await Promise.all([
    prisma.menuItem.findMany({ where: { businessId, available: true } }),
    prisma.inventoryItem.findMany({ where: { businessId } }),
    prisma.staffShift.findMany({ where: { businessId } }),
    prisma.supplier.findMany({ where: { businessId } }),
  ]);

  return JSON.stringify(
    {
      menu: menuItems.map((m) => ({ name: m.name, category: m.category, price: m.priceSgd })),
      inventory: inventory.map((i) => ({
        name: i.name,
        qty: i.quantity,
        unit: i.unit,
        reorderAt: i.reorderLevel,
      })),
      staff: staffShifts.map((s) => ({
        name: s.staffName,
        role: s.role,
        date: s.date,
        available: s.available,
      })),
      suppliers: suppliers.map((s) => ({
        name: s.name,
        contact: s.contact,
        items: s.items,
      })),
    },
    null,
    2
  );
}

const AGENT_PROMPT_MAP: Record<string, string> = {
  sales: "sales-agent",
  ops: "ops-agent",
  admin: "admin-agent",
  call: "call-agent",
  marketing: "marketing-agent",
};

export async function runFullPipeline(
  conversationId: string,
  messageBody: string,
  businessId: string
): Promise<string> {
  const agentRun = await prisma.agentRun.create({
    data: { conversationId, status: "running" },
  });

  try {
    const businessContext = await buildBusinessContext(businessId);
    const routerOutput = await runRouter(messageBody, businessContext);

    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: { routerOutput: routerOutput as object },
    });

    const agentsToRun = routerOutput.agents.filter((a) => AGENT_PROMPT_MAP[a]);

    const agentResults = await Promise.allSettled(
      agentsToRun.map(async (type) => ({
        type,
        result: await runAgent(AGENT_PROMPT_MAP[type], messageBody, businessContext, routerOutput),
      }))
    );

    for (const settled of agentResults) {
      if (settled.status === "fulfilled") {
        const { type, result } = settled.value;
        const body = result as Record<string, unknown>;

        await Promise.all([
          prisma.recommendation.create({
            data: {
              agentRunId: agentRun.id,
              agentType: type,
              type: (body.type as string) || type,
              title: (body.title as string) || `${type} recommendation`,
              body: result,
              priority: (body.priority as string) || "normal",
            },
          }),
          prisma.approvalItem.create({
            data: {
              agentRunId: agentRun.id,
              type: (body.type as string) || type,
              title: (body.title as string) || `${type} recommendation`,
              content: result,
              status: "pending",
            },
          }),
        ]);
      }
    }

    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: { status: "complete" },
    });

    return agentRun.id;
  } catch (error) {
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: { status: "failed" },
    });
    throw error;
  }
}
