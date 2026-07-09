"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bictorysChargesUrl } from "@/lib/bictorys";

const TIER_PRICES: Record<string, number> = {
  ESSENTIAL: 1500,
  STANDARD: 3500,
  PREMIUM: 5000,
};

export async function startCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const tier = (formData.get("tier") as string) || "STANDARD";
  const amount = TIER_PRICES[tier] || 3500;
  
  const apiKey = process.env.BICTORYS_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Demo/Mock mode if Bictorys credentials are not configured
  if (!apiKey || apiKey.trim() === "" || apiKey.startsWith("your_")) {
    const mockId = `mock_bictorys_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: "XOF",
        status: "PENDING",
        bictorysId: mockId,
        tier,
      },
    });

    redirect(`/subscription/mock-checkout?paymentId=${payment.id}`);
  }

  // Pre-create local payment record first to get a unique internal ID
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amount,
      currency: "XOF",
      status: "PENDING",
      tier,
    },
  });

  // Real Bictorys checkout. NB: keep every redirect() OUTSIDE the try —
  // Next signals redirects by throwing, which a surrounding catch would swallow.
  let paymentUrl: string | undefined;
  let chargeId: string | undefined;
  let initFailed = false;

  try {
    const response = await fetch(bictorysChargesUrl(apiKey), {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "XOF",
        country: process.env.BICTORYS_COUNTRY || "CI",
        paymentReference: `Prevora ${tier} - 1 Mois`,
        merchantReference: payment.id,
        successRedirectUrl: `${baseUrl}/subscription/callback?paymentId=${payment.id}&status=success`,
        errorRedirectUrl: `${baseUrl}/subscription/callback?paymentId=${payment.id}&status=failure`,
        customerObject: {
          name: user.name || "Utilisateur Prevora",
          email: user.email,
        },
      }),
    });

    if (!response.ok) {
      console.error("Bictorys initialization failed:", await response.text());
      initFailed = true;
    } else {
      const data = await response.json();
      // Bictorys returns the checkout URL as `link` (or `redirectUrl`) and the
      // charge id as `chargeId` (or `transactionId`).
      paymentUrl = data.link || data.redirectUrl || data.paymentUrl;
      chargeId = data.chargeId || data.transactionId || data.id;
    }
  } catch (err) {
    console.error("Bictorys payment error:", err);
    initFailed = true;
  }

  if (initFailed) redirect("/subscription?error=bictorys_init");
  if (!paymentUrl) {
    console.error("Bictorys response missing payment URL");
    redirect("/subscription?error=bictorys_response");
  }

  if (chargeId) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { bictorysId: chargeId },
    });
  }

  redirect(paymentUrl);
}

/** Simulate a payment outcome in Mock mode */
export async function simulatePaymentAction(paymentId: string, status: "SUCCESS" | "FAILED") {
  const user = await requireUser();

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: user.id },
  });

  if (!payment) {
    throw new Error("Paiement non trouvé");
  }

  if (payment.status !== "PENDING") {
    return { ok: false, message: "Ce paiement a déjà été traité." };
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status },
  });

  if (status === "SUCCESS") {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days active

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
