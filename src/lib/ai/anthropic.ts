import type { AIProvider, ChatMessage, CompletionOptions } from "./types";

/**
 * Anthropic provider via the REST API (no extra SDK dependency).
 * System messages are hoisted into the top-level `system` param.
 */
export function createAnthropicProvider(): AIProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const model = process.env.AI_MODEL || "claude-haiku-4-5-20251001";

  return {
    name: "anthropic",
    async complete(messages: ChatMessage[], options?: CompletionOptions) {
      const system = messages
        .filter((m) => m.role === "system")
        .map((m) => m.content)
        .join("\n\n");
      const rest = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens ?? 700,
          temperature: options?.temperature ?? 0.5,
          system: options?.json
            ? `${system}\n\nRéponds uniquement avec du JSON valide.`
            : system,
          messages: rest,
        }),
      });

      if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
      const data = (await res.json()) as {
        content: Array<{ type: string; text?: string }>;
      };
      return data.content.map((c) => c.text ?? "").join("");
    },
  };
}
