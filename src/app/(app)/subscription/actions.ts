"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TIER_PRICES: Record<string, number> = {
  ESSENTIAL: 1500,
  STANDARD: 3500,
  PREMIUM: 5000,
};

export async function startCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const tier = (formData.get("tier") as string) || "STANDARD";
  const amount = TIER_PRICES[tier] || 3500;
  
  const secretKey = process.env.MONEROO_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Demo/Mock mode if Moneroo credentials are not configured
  if (!secretKey || secretKey.trim() === "" || secretKey.startsWith("your_")) {
    const mockId = `mock_moneroo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: "XOF",
        status: "PENDING",
        monerooId: mockId,
        tier,
      },
    });

    redirect(`/subscription/mock-checkout?paymentId=${payment.id}`);
  }

  // Real Moneroo checkout
  try {
    const response = await fetch("https://api.moneroo.io/v1/payments/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "XOF",
        description: `Prevora ${tier} - 1 Mois`,
        customer: {
          name: user.name || "Utilisateur Prevora",
          email: user.email,
        },
        return_url: `${baseUrl}/subscription/callback`,
        metadata: {
          userId: user.id,
          tier,
        },
      }),
    });

    if (!response.ok) {
      console.error("Moneroo initialization failed:", await response.text());
      redirect("/subscription?error=moneroo_init");
    }

    const data = await response.json();
    if (!data.checkout_url || !data.id) {
      console.error("Moneroo invalid response structure:", data);
      redirect("/subscription?error=moneroo_response");
    }

    // Save pending payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: "XOF",
        status: "PENDING",
        monerooId: data.id,
        tier,
      },
    });

    redirect(data.checkout_url);
  } catch (err) {
    console.error("Moneroo payment error:", err);
    redirect("/subscription?error=checkout_error");
  }
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
