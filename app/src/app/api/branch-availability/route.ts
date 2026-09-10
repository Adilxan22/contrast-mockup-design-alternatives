import { NextResponse } from "next/server";
import { z } from "zod";
import { getBranchAvailability } from "@/lib/catalog";

const schema = z.object({
  items: z
    .array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive() }))
    .min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const availability = await getBranchAvailability(parsed.data.items);
  return NextResponse.json({ availability });
}
