import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-secret-key");
    const webhookSecret = process.env.BICTORYS_WEBHOOK_SECRET;

    // Verify webhook signature authenticity
    if (webhookSecret && secret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status, paymentReference, merchantReference } = body;

    // Bictorys sends status: 'success', 'approved', 'succès', 'failed', 'échoué'
    const dbStatus = (status === "success" || status === "approved" || status === "succès") ? "SUCCESS" : "FAILED";

    // 1. Look up payment by local ID first (merchantReference), fallback to Bictorys ID (paymentReference)
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id: merchantReference },
          { bictorysId: paymentReference }
        ]
      }
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    // Update payment record in database
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: dbStatus,
        bictorysId: paymentReference || payment.bictorysId,
      },
    });

    // If success, activate subscription access
    if (dbStatus === "SUCCESS") {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days active

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPremium: true,
          premiumExpiresAt: expiresAt,
          subscriptionTier: payment.tier,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Bictorys webhook processing error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
