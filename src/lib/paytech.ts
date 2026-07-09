import "server-only";
import crypto from "node:crypto";

/**
 * PayTech helpers (server-side).
 * Docs: https://docs.intech.sn/doc_paytech.php
 *
 * One endpoint for both environments; the `env` body param ("test" | "prod")
 * selects sandbox vs production. Confirmation is delivered via IPN (webhook).
 */

export const PAYTECH_REQUEST_URL =
  "https://paytech.sn/api/payment/request-payment";

export function paytechEnv(): "test" | "prod" {
  return process.env.PAYTECH_ENV === "prod" ? "prod" : "test";
}

export function isPaytechComplete(type?: string | null): boolean {
  return typeof type === "string" && type.toLowerCase() === "sale_complete";
}

export function isPaytechCanceled(type?: string | null): boolean {
  return (
    typeof type === "string" &&
    ["sale_canceled", "sale_cancelled"].includes(type.toLowerCase())
  );
}

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

/**
 * Verify a PayTech IPN. Accepts either the classic SHA256 method
 * (sha256(API_KEY) === api_key_sha256 && sha256(API_SECRET) === api_secret_sha256)
 * or the newer HMAC method
 * (HMAC-SHA256("<final_item_price>|<ref_command>|<API_KEY>", API_SECRET) === hmac_compute).
 */
export function verifyPaytechIpn(
  fields: Record<string, string>,
  apiKey: string,
  apiSecret: string,
): boolean {
  const keyOk =
    !!fields.api_key_sha256 && fields.api_key_sha256 === sha256(apiKey);
  const secretOk =
    !!fields.api_secret_sha256 && fields.api_secret_sha256 === sha256(apiSecret);
  if (keyOk && secretOk) return true;

  if (fields.hmac_compute) {
    const price = fields.final_item_price ?? fields.item_price ?? "";
    const message = `${price}|${fields.ref_command}|${apiKey}`;
    const hmac = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");
    if (hmac === fields.hmac_compute) return true;
  }
  return false;
}
