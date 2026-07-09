import type { AIProvider } from "./types";
import { mockProvider } from "./mock";
import { createOpenAIProvider } from "./openai";
import { createAnthropicProvider } from "./anthropic";

let cached: AIProvider | null = null;

/**
 * Resolve the configured AI provider. Falls back to the deterministic mock
 * when the requested provider has no API key, so the app never hard-fails.
 */
export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();

  try {
    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      cached = createOpenAIProvider();
    } else if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
      cached = createAnthropicProvider();
    } else {
      cached = mockProvider;
    }
  } catch {
    cached = mockProvider;
  }

  return cached;
}

export * from "./types";
export * from "./health";
