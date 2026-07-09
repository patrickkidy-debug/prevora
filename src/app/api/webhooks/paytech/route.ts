import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isPaytechComplete,
  isPaytechCanceled,
  verifyPaytechIpn,
} from "@/lib/paytech";

/**
 * PayTech IPN (Instant Payment Notification).
 * PayTech POSTs form fields to this URL. We verify authenticity (SHA256 / HMAC),
 * then activate on `sale_complete` and fail on `sale_canceled`.
 */
export async function POST(request: Request) {
  try {
    // PayTech sends form-encoded (or multipart) fields.
    const contentType = request.headers.get("content-type") || "";
    const fields: Record<string, string> = {};
    if (contentType.includes("application/json")) {
      Object.assign(fields, await request.json());
    } else {
      const fd = await request.formData();
      fd.forEach((v, k) => {
        fields[k] = String(v);
      });
    }

    const apiKey = process.env.PAYTECH_API_KEY;
    const apiSecret = process.env.PAYTECH_API_SECRET;

    if (apiKey && apiSecret && !verifyPaytechIpn(fields, apiKey, apiSecret)) {
      return NextResponse.json({ error: "Invalid IPN" }, { status: 403 });
    }

    const type = fields.type_event;
    const ref = fields.ref_command; // == our payment.id
    const token = fields.token;

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id: ref }, { providerRef: token }].filter(
          (c) => Object.values(c)[0],
        ),
      },
    });

    // Unknown payment: ack 200 so PayTech stops retrying.
    if (!payment) return NextResponse.json({ ignored: true });

    if (isPaytechComplete(type)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", providerRef: token ?? payment.providerRef },
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
    } else if (isPaytechCanceled(type) && payment.status !== "SUCCESS") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("PayTech IPN error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
