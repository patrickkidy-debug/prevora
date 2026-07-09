"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function startCheckoutAction() {
  const user = await requireUser();
  const secretKey = process.env.MONEROO_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Demo/Mock mode if Moneroo credentials are not configured
  if (!secretKey || secretKey.trim() === "" || secretKey.startsWith("your_")) {
    const mockId = `mock_moneroo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 9.99,
        currency: "EUR",
        status: "PENDING",
        monerooId: mockId,
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
        amount: 9.99,
        currency: "EUR",
        description: "Prevora Premium - 1 Mois",
        customer: {
          name: user.name || "Utilisateur Prevora",
          email: user.email,
        },
        return_url: `${baseUrl}/subscription/callback`,
        metadata: {
          userId: user.id,
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
        amount: 9.99,
        currency: "EUR",
        status: "PENDING",
        monerooId: data.id,
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
      },
    });

    return { ok: true, success: true };
  }

  return { ok: true, success: false };
}
