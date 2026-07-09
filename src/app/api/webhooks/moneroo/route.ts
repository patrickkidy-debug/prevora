import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, data } = body;

    if (!data || !data.id) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    const secretKey = process.env.MONEROO_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Moneroo credentials missing" }, { status: 500 });
    }

    // Verify payment by fetching directly from Moneroo API
    const response = await fetch(`https://api.moneroo.io/v1/payments/${data.id}`, {
      headers: {
        "Authorization": `Bearer ${secretKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to verify transaction status" }, { status: 400 });
    }

    const verifiedData = await response.json();
    const monerooId = verifiedData.id;
    const status = verifiedData.status; // 'approved', 'success', 'failed', etc.
    const metadata = verifiedData.metadata || {};
    const userId = metadata.userId;
    const tier = metadata.tier || "STANDARD";

    if (!userId) {
      return NextResponse.json({ error: "Missing userId in metadata" }, { status: 400 });
    }

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { monerooId },
    });

    const dbStatus = (status === "approved" || status === "success") ? "SUCCESS" : "FAILED";

    if (payment) {
      // Update existing record
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: dbStatus, tier },
      });
    } else {
      // Create new record if it wasn't tracked yet
      await prisma.payment.create({
        data: {
          userId,
          amount: parseFloat(verifiedData.amount || "3500"),
          currency: verifiedData.currency || "XOF",
          status: dbStatus,
          monerooId,
          tier,
        },
      });
    }

    if (dbStatus === "SUCCESS") {
      // Activate Premium & Tier
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumExpiresAt: expiresAt,
          subscriptionTier: tier,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
