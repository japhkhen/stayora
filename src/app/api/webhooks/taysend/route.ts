import { createHmac, timingSafeEqual } from "node:crypto";

export async function POST(request: Request) {
  const raw = await request.text();
  const header =
    request.headers.get("taysend-signature") ||
    request.headers.get("x-taysend-signature") ||
    "";
  const secret = process.env.TAYSEND_WEBHOOK_SECRET;

  if (secret) {
    const parts = Object.fromEntries(
      header.split(",").map((part) => {
        const [key, ...rest] = part.split("=");
        return [key?.trim(), rest.join("=").trim()];
      }),
    );
    const timestamp = Number(parts.t);
    const now = Math.floor(Date.now() / 1000);
    if (!timestamp || Math.abs(now - timestamp) > 300) {
      return Response.json({ error: "Signature timestamp is outside the window" }, { status: 401 });
    }
    const expected = createHmac("sha256", secret).update(`${timestamp}.${raw}`).digest("hex");
    const left = Buffer.from(expected);
    const right = Buffer.from(parts.v1 ?? "");
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      return Response.json({ error: "Signature did not match" }, { status: 401 });
    }
  }

  return Response.json({ received: true });
}
