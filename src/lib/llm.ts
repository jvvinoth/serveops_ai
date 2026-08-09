import OpenAI from "openai";

export const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

function getLLM(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || "placeholder",
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "ServeOps AI",
    },
  });
}

export async function callLLM(
  systemPrompt: string,
  userMessage: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const response = await getLLM().chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
  });
  return response.choices[0].message.content || "{}";
}
