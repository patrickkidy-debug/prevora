import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Temporary latency probe. Measures DB + auth round-trips from the Netlify
// function so we can pinpoint what makes authenticated pages slow.
export async function GET() {
  const out: Record<string, unknown> = {
    region:
      process.env.AWS_REGION ||
      process.env.NETLIFY_REGION ||
      process.env.VERCEL_REGION ||
      "unknown",
    node: process.version,
  };

  // 1) DB ping (first query = includes any connection setup).
  let t = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    out.dbPing1Ms = Date.now() - t;
  } catch (e) {
    out.dbPing1Ms = Date.now() - t;
    out.dbError = String((e as Error).message);
  }

  // 2) Second DB query (warm connection).
  t = Date.now();
  try {
    await prisma.user.count();
    out.dbPing2Ms = Date.now() - t;
  } catch (e) {
    out.dbPing2Ms = Date.now() - t;
    out.dbError2 = String((e as Error).message);
  }

  // 3) Supabase auth round-trip (unauthenticated -> still times the network).
  t = Date.now();
  try {
    const supabase = await createClient();
    await supabase.auth.getUser();
    out.authMs = Date.now() - t;
  } catch (e) {
    out.authMs = Date.now() - t;
    out.authError = String((e as Error).message);
  }

  return NextResponse.json(out);
}
