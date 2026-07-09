import OpenAI from "openai";
import type { AIProvider, ChatMessage, CompletionOptions } from "./types";

export function createOpenAIProvider(): AIProvider {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  return {
    name: "openai",
    async complete(messages: ChatMessage[], options?: CompletionOptions) {
      const res = await client.chat.completions.create({
        model,
        temperature: options?.temperature ?? 0.5,
        max_tokens: options?.maxTokens ?? 700,
        response_format: options?.json ? { type: "json_object" } : undefined,
        messages,
      });
      return res.choices[0]?.message?.content ?? "";
    },
  };
}
