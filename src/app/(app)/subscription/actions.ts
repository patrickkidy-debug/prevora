"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAYTECH_REQUEST_URL, paytechEnv } from "@/lib/paytech";

const TIER_PRICES: Record<string, number> = {
  ESSENTIAL: 1500,
  STANDARD: 3500,
  PREMIUM: 5000,
};

export async function startCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const tier = (formData.get("tier") as string) || "STANDARD";
  const amount = TIER_PRICES[tier] || 3500;

  const apiKey = process.env.PAYTECH_API_KEY;
  const apiSecret = process.env.PAYTECH_API_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Demo/Mock mode when PayTech credentials are not configured.
  if (!apiKey || !apiSecret || apiKey.startsWith("your_")) {
    const mockId = `mock_paytech_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: "XOF",
        status: "PENDING",
        providerRef: mockId,
        tier,
      },
    });
    redirect(`/subscription/mock-checkout?paymentId=${payment.id}`);
  }

  // Pre-create local payment; its id is our PayTech ref_command.
  const payment = await prisma.payment.create({
    data: { userId: user.id, amount, currency: "XOF", status: "PENDING", tier },
  });

  // Keep every redirect() OUTSIDE the try — Next signals redirects by throwing.
  let paymentUrl: string | undefined;
  let token: string | undefined;
  let failed = false;

  try {
    const body: Record<string, unknown> = {
      item_name: `Prevora ${tier} - 1 Mois`,
      item_price: amount,
      currency: "XOF",
      ref_command: payment.id,
      command_name: `Abonnement Prevora ${tier}`,
      env: paytechEnv(),
      success_url: `${baseUrl}/subscription/callback?paymentId=${payment.id}&status=success`,
      cancel_url: `${baseUrl}/subscription/callback?paymentId=${payment.id}&status=cancel`,
      custom_field: JSON.stringify({ payment_id: payment.id }),
    };
    // IPN must be HTTPS; only send it when we have a public https base.
    if (baseUrl.startsWith("https://")) {
      body.ipn_url = `${baseUrl}/api/webhooks/paytech`;
    }

    const res = await fetch(PAYTECH_REQUEST_URL, {
      method: "POST",
      headers: {
        API_KEY: apiKey,
        API_SECRET: apiSecret,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("PayTech request failed:", await res.text());
      failed = true;
    } else {
      const data = await res.json();
      if (data.success === 1 || data.success === "1") {
        paymentUrl = data.redirect_url || data.redirectUrl;
        token = data.token;
      } else {
        console.error("PayTech error response:", data);
        failed = true;
      }
    }
  } catch (err) {
    console.error("PayTech error:", err);
    failed = true;
  }

  if (failed) redirect("/subscription?error=paytech_init");
  if (!paymentUrl) {
    console.error("PayTech response missing redirect_url");
    redirect("/subscription?error=paytech_response");
  }

  if (token) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { providerRef: token },
    });
  }

  redirect(paymentUrl);
}

/** Simulate a payment outcome in Mock mode. */
export async function simulatePaymentAction(
  paymentId: string,
  status: "SUCCESS" | "FAILED",
) {
  const user = await requireUser();

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: user.id },
  });
  if (!payment) throw new Error("Paiement non trouvé");
  if (payment.status !== "PENDING") {
    return { ok: false, message: "Ce paiement a déjà été traité." };
  }

  await prisma.payment.update({ where: { id: paymentId }, data: { status } });

  if (status === "SUCCESS") {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isPremium: true,
        premiumExpiresAt: expiresAt,
        subscriptionTier: payment.tier,
      },
    });
    return { ok: true, success: true };
  }

  return { ok: true, success: false };
}
