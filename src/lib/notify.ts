import { formatDate, formatGhs } from "@/lib/format";
import { sendEmail } from "@/lib/mail";
import { createPublicClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/taysend";

type NoticeStay = {
  id?: string;
  reference: string;
  guest_email: string;
  guest_name?: string;
  guest_phone?: string;
  phone?: string;
  room_name?: string;
  total_ghs: number;
  check_in: string;
  check_out: string;
  nights?: number;
};

async function logNotice(input: {
  channel: "email" | "sms";
  recipient: string;
  subject?: string;
  body: string;
  provider: string;
  providerId?: string | null;
  status: string;
  reservationId?: string;
}) {
  const secret = process.env.STAYORA_WEBHOOK_SECRET;
  if (!secret) return;
  const supabase = createPublicClient();
  await supabase.rpc("stayora_log_notice", {
    p_secret: secret,
    p_channel: input.channel,
    p_recipient: input.recipient,
    p_subject: input.subject ?? null,
    p_body: input.body,
    p_provider: input.provider,
    p_provider_id: input.providerId ?? null,
    p_status: input.status,
    p_reservation: input.reservationId ?? null,
  });
}

function emailHtml(title: string, paragraphs: string[]) {
  const body = paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#3c2f27;">${paragraph}</p>`,
    )
    .join("");
  return `<div style="background:#f6f1ea;padding:32px 16px;font-family:Georgia,serif;">
    <div style="max-width:560px;margin:0 auto;background:#fffcf8;border-radius:24px;padding:36px 32px;">
      <p style="letter-spacing:.22em;text-transform:uppercase;font-size:12px;color:#9a7844;font-family:Arial,sans-serif;">Stayora · Kumasi</p>
      <h1 style="font-weight:500;font-size:32px;margin:12px 0 18px;color:#1c1714;">${title}</h1>
      ${body}
      <p style="margin-top:24px;font-size:14px;color:#6f675f;font-family:Arial,sans-serif;">Ahodwo Ridge, Kumasi · 0599 873 467 · 0256 206 383</p>
    </div>
  </div>`;
}

export async function notifyStay(
  kind: "hold" | "confirmed" | "cancelled",
  stay: NoticeStay,
) {
  const name = stay.guest_name || "there";
  const room = stay.room_name || "your room";
  const when = `${formatDate(stay.check_in)} to ${formatDate(stay.check_out)}`;
  const phone = stay.guest_phone || stay.phone || "";
  const subject =
    kind === "confirmed"
      ? `Your Stayora stay is confirmed · ${stay.reference}`
      : kind === "cancelled"
        ? `Stayora stay cancelled · ${stay.reference}`
        : `We are holding ${room} · ${stay.reference}`;
  const paragraphs =
    kind === "confirmed"
      ? [
          `Hello ${name}, your room is confirmed.`,
          `${room} · ${when} · ${formatGhs(stay.total_ghs)}.`,
          `Show reference ${stay.reference} at the desk. Check-in is from 2:00 PM. We will have cold towels and breakfast waiting.`,
        ]
      : kind === "cancelled"
        ? [
            `Hello ${name}, ${stay.reference} is cancelled.`,
            `If a payment was taken, the front desk will arrange the refund and text you when it is on the way.`,
          ]
        : [
            `Hello ${name}, we are holding ${room} for ${when}.`,
            `The total is ${formatGhs(stay.total_ghs)}. Approve the mobile-money prompt to confirm the stay. The hold lasts about 45 minutes.`,
          ];
  const html = emailHtml(
    kind === "confirmed" ? "You are booked." : kind === "cancelled" ? "Stay cancelled" : "Your room is on hold",
    paragraphs,
  );
  const sms =
    kind === "confirmed"
      ? `Stayora: ${stay.reference} is confirmed. ${room}, ${when}. Total ${formatGhs(stay.total_ghs)}. Desk: 0599 873 467.`
      : kind === "cancelled"
        ? `Stayora: ${stay.reference} is cancelled. Call 0599 873 467 if you still need a room.`
        : `Stayora: holding ${stay.reference} for ${formatGhs(stay.total_ghs)}. Approve MoMo to confirm. 0599 873 467.`;

  const emailResult = await sendEmail({
    to: stay.guest_email,
    subject,
    html,
  }).catch((error: Error) => ({ id: null, status: "failed", detail: error.message }));

  await logNotice({
    channel: "email",
    recipient: stay.guest_email,
    subject,
    body: paragraphs.join(" "),
    provider: "resend",
    providerId: emailResult.id,
    status: "detail" in emailResult && emailResult.detail ? `${emailResult.status}: ${emailResult.detail}` : emailResult.status,
    reservationId: stay.id,
  });

  if (phone) {
    const smsResult = await sendSms(phone, sms).catch((error: Error) => ({
      id: null,
      status: "failed",
      detail: error.message,
    }));
    await logNotice({
      channel: "sms",
      recipient: phone,
      body: sms,
      provider: "taysend",
      providerId: smsResult.id,
      status: "detail" in smsResult && smsResult.detail ? `${smsResult.status}: ${smsResult.detail}` : smsResult.status,
      reservationId: stay.id,
    });
  }
}
