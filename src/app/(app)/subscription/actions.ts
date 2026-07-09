"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fedapayUrl } from "@/lib/fedapay";

const TIER_PRICES: Record<string, number> = {
  ESSENTIAL: 1500,
  STANDARD: 3500,
  PREMIUM: 5000,
};

export async function startCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const tier = (formData.get("tier") as string) || "STANDARD";
  const amount = TIER_PRICES[tier] || 3500;

  const apiKey = process.env.FEDAPAY_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Demo/Mock mode when FedaPay credentials are not configured.
  if (!apiKey || apiKey.trim() === "" || apiKey.startsWith("your_")) {
    const mockId = `mock_fedapay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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

  // Pre-create local payment record (used as our merchant reference).
  const payment = await prisma.payment.create({
    data: { userId: user.id, amount, currency: "XOF", status: "PENDING", tier },
  });

  const [firstname, ...rest] = (user.name || "Utilisateur Prevora").trim().split(" ");
  const lastname = rest.join(" ") || "Prevora";

  // Keep every redirect() OUTSIDE the try — Next signals redirects by throwing,
  // which a surrounding catch would swallow.
  let paymentUrl: string | undefined;
  let transactionId: string | undefined;
  let failed = false;

  try {
    // 1) Create the transaction.
    const createRes = await fetch(fedapayUrl(apiKey, "/transactions"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        description: `Prevora ${tier} - 1 Mois`,
        amount,
        currency: { iso: "XOF" },
        callback_url: `${baseUrl}/subscription/callback?paymentId=${payment.id}`,
        custom_metadata: { payment_id: payment.id },
        customer: { firstname, lastname, email: user.email },
      }),
    });

    if (!createRes.ok) {
      console.error("FedaPay create failed:", await createRes.text());
      failed = true;
    } else {
      const data = await createRes.json();
      const tx = data["v1/transaction"] || data.transaction || data;
      transactionId = tx?.id != null ? String(tx.id) : undefined;

      if (!transactionId) {
        console.error("FedaPay: missing transaction id", data);
        failed = true;
      } else {
        // 2) Generate the payment token + checkout URL.
        const tokRes = await fetch(
          fedapayUrl(apiKey, `/transactions/${transactionId}/token`),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );
        if (!tokRes.ok) {
          console.error("FedaPay token failed:", await tokRes.text());
          failed = true;
        } else {
          const tok = await tokRes.json();
          paymentUrl = tok.url || tok?.["v1/token"]?.url;
        }
      }
    }
  } catch (err) {
    console.error("FedaPay error:", err);
    failed = true;
  }

  if (failed) redirect("/subscription?error=fedapay_init");
  if (!paymentUrl) {
    console.error("FedaPay response missing payment URL");
    redirect("/subscription?error=fedapay_response");
  }

  if (transactionId) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { providerRef: transactionId },
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
