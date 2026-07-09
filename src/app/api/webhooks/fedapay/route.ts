import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isFedapayApproved,
  isFedapayFailed,
  verifyFedapaySignature,
} from "@/lib/fedapay";

/**
 * FedaPay webhook. Verifies the `X-FEDAPAY-SIGNATURE` header (HMAC-SHA256 of
 * the raw body with the endpoint secret), then activates or fails the payment.
 * Event names: transaction.approved / transaction.canceled / transaction.declined.
 */
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const signature = request.headers.get("x-fedapay-signature");
    const secret = process.env.FEDAPAY_WEBHOOK_SECRET;

    if (secret && !verifyFedapaySignature(raw, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const event = JSON.parse(raw);
    const name: string | undefined = event?.name;
    const tx = event?.entity ?? event?.object ?? event?.data ?? {};
    const txId = tx?.id != null ? String(tx.id) : undefined;
    const status: string | undefined = tx?.status;
    const paymentId = tx?.custom_metadata?.payment_id as string | undefined;

    // Locate the local payment by our id (metadata) or the FedaPay tx id.
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id: paymentId }, { providerRef: txId }].filter(
          (c) => Object.values(c)[0],
        ),
      },
    });

    // Unknown payment: ack with 200 so FedaPay doesn't keep retrying.
    if (!payment) return NextResponse.json({ ignored: true });

    const approved =
      name === "transaction.approved" || isFedapayApproved(status);
    const failed =
      name === "transaction.canceled" ||
      name === "transaction.declined" ||
      isFedapayFailed(status);

    if (approved) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", providerRef: txId ?? payment.providerRef },
      });
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPremium: true,
          premiumExpiresAt: expiresAt,
          subscriptionTier: payment.tier,
        },
      });
    } else if (failed && payment.status !== "SUCCESS") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("FedaPay webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
