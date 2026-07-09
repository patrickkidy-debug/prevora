export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  /** Ask the provider to return strict JSON. */
  json?: boolean;
}

/**
 * Minimal LLM provider contract. Swapping providers (OpenAI, Anthropic, a
 * local model, or the deterministic mock) only requires implementing this.
 */
export interface AIProvider {
  readonly name: string;
  complete(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): Promise<string>;
}
