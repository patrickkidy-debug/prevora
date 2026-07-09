import "server-only";
import crypto from "node:crypto";

/**
 * FedaPay helpers (server-side).
 * Docs: https://docs.fedapay.com — API v1.
 *
 * Test vs live is inferred from the secret key prefix: `sk_live_...` hits
 * production, anything else (e.g. `sk_sandbox_...`) hits the sandbox.
 */

const LIVE_BASE = "https://api.fedapay.com";
const SANDBOX_BASE = "https://sandbox-api.fedapay.com";

export function fedapayBaseUrl(secretKey: string): string {
  return secretKey.includes("live") ? LIVE_BASE : SANDBOX_BASE;
}

export function fedapayUrl(secretKey: string, path: string): string {
  return `${fedapayBaseUrl(secretKey)}/v1${path}`;
}

// FedaPay transaction statuses that mean the payment succeeded / failed.
const APPROVED = new Set(["approved", "transferred"]);
const FAILED = new Set(["canceled", "cancelled", "declined", "refunded", "expired"]);

export function isFedapayApproved(status?: string | null): boolean {
  return typeof status === "string" && APPROVED.has(status.toLowerCase());
}

export function isFedapayFailed(status?: string | null): boolean {
  return typeof status === "string" && FAILED.has(status.toLowerCase());
}

/**
 * Verify a FedaPay webhook signature (header `X-FEDAPAY-SIGNATURE`).
 * FedaPay signs the raw body with HMAC-SHA256 using the endpoint secret.
 * We accept a plain hex digest or a header that embeds it (e.g. `t=..,s=<hex>`).
 */
export function verifyFedapaySignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  const sig = signature.toLowerCase();
  return sig === expected || sig.includes(expected);
}
