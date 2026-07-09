import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isBictorysPaid } from "@/lib/bictorys";

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-secret-key");
    const webhookSecret = process.env.BICTORYS_WEBHOOK_SECRET;

    // Verify webhook signature authenticity
    if (webhookSecret && secret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status, paymentReference, merchantReference, id } = body;

    // Bictorys success statuses: 'succeeded' / 'authorized' (case-insensitive).
    const dbStatus = isBictorysPaid(status) ? "SUCCESS" : "FAILED";

    // Match our local payment: merchantReference == payment.id (what we sent),
    // fall back to the Bictorys charge/transaction id.
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id: merchantReference },
          { bictorysId: paymentReference },
          { bictorysId: id },
        ].filter((c) => Object.values(c)[0]),
      },
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
