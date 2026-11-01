import { Resend } from "resend";

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { id: null as string | null, status: "not_configured" };
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM || "Stayora <onboarding@resend.dev>",
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
  if (error) return { id: null, status: "failed", detail: error.message };
  return { id: data?.id ?? null, status: "sent" };
}
