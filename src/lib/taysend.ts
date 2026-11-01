import { toIntlGh } from "@/lib/format";

export async function sendSms(to: string, message: string) {
  const key = process.env.TAYSEND_API_KEY;
  if (!key) {
    return { id: null as string | null, status: "not_configured" };
  }
  const response = await fetch("https://api.taysend.com/v1/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      to: toIntlGh(to),
      sender_id: process.env.TAYSEND_SENDER_ID || "Stayora",
      message,
      type: "transactional",
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
    error?: { message?: string };
    message?: string;
  };
  if (!response.ok) {
    return {
      id: null,
      status: "failed",
      detail: payload.error?.message || payload.message || `HTTP ${response.status}`,
    };
  }
  return { id: payload.id ?? null, status: payload.status || "queued" };
}
