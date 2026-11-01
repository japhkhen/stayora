import { interpretMoolre, type MoolreBody } from "@/lib/moolre";
import { notifyStay } from "@/lib/notify";
import { createPublicClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as MoolreBody | null;
  if (!payload) return Response.json({ error: "Expected JSON" }, { status: 400 });

  const expected = process.env.MOOLRE_WEBHOOK_SECRET;
  if (expected && payload.data?.secret && payload.data.secret !== expected) {
    return Response.json({ error: "Callback secret did not match" }, { status: 401 });
  }

  const externalRef = payload.data?.externalref;
  if (!externalRef) return Response.json({ error: "Missing external reference" }, { status: 400 });

  const status = interpretMoolre(payload);
  const amount = payload.data?.amount != null ? Number(payload.data.amount) : null;
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("stayora_apply_payment", {
    p_secret: process.env.STAYORA_WEBHOOK_SECRET ?? "",
    p_external_ref: externalRef,
    p_status: status === "otp_required" ? "processing" : status,
    p_provider_ref: payload.data?.transactionid ?? null,
    p_amount: status === "paid" ? amount : null,
    p_raw: payload,
  });

  if (error) return Response.json({ error: error.message }, { status: 400 });

  const stay = data as {
    reference: string;
    email: string;
    guest_name: string;
    phone: string;
    total_ghs: number;
    check_in: string;
    check_out: string;
    duplicate?: boolean;
  } | null;

  if (status === "paid" && stay && !stay.duplicate) {
    await notifyStay("confirmed", {
      reference: stay.reference,
      guest_email: stay.email,
      guest_name: stay.guest_name,
      guest_phone: stay.phone,
      total_ghs: stay.total_ghs,
      check_in: stay.check_in,
      check_out: stay.check_out,
    }).catch(() => undefined);
  }

  return Response.json({ received: true });
}
