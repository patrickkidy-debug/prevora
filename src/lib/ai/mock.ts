import type { AIProvider, ChatMessage, CompletionOptions } from "./types";

/**
 * Deterministic, offline provider. Returns the pre-built narrative embedded in
 * the user prompt so the app is fully functional without any API key.
 * The high-level helpers always pass a `FALLBACK:` block for this reason.
 */
export const mockProvider: AIProvider = {
  name: "mock",
  async complete(messages: ChatMessage[], options?: CompletionOptions) {
    const user = [...messages].reverse().find((m) => m.role === "user");
    const content = user?.content ?? "";
    const marker = "FALLBACK:";
    const idx = content.indexOf(marker);
    const fallback =
      idx >= 0 ? content.slice(idx + marker.length).trim() : content.trim();

    if (options?.json) {
      // If a JSON fallback was provided, return it as-is; else wrap it.
      try {
        JSON.parse(fallback);
        return fallback;
      } catch {
        return JSON.stringify({ summary: fallback });
      }
    }
    return fallback;
  },
};
