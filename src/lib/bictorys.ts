/**
 * Bictorys payment helpers (server-side).
 * Docs: https://docs.bictorys.com — Pay API v1 (/pay/v1/charges).
 *
 * Test vs production is inferred from the secret key: sandbox keys contain
 * "test" (e.g. `test_secret-...`), live keys do not.
 */

const TEST_BASE = "https://api.test.bictorys.com/pay/v1";
const LIVE_BASE = "https://api.bictorys.com/pay/v1";

export function isBictorysTestKey(apiKey: string): boolean {
  return apiKey.toLowerCase().includes("test");
}

export function bictorysBaseUrl(apiKey: string): string {
  return isBictorysTestKey(apiKey) ? TEST_BASE : LIVE_BASE;
}

export function bictorysChargesUrl(apiKey: string): string {
  return `${bictorysBaseUrl(apiKey)}/charges`;
}

// Bictorys success/paid statuses (webhook + charge lookup), case-insensitive.
const PAID = new Set([
  "succeeded",
  "authorized",
  "success",
  "approved",
  "paid",
]);

export function isBictorysPaid(status?: string | null): boolean {
  return typeof status === "string" && PAID.has(status.toLowerCase());
}
