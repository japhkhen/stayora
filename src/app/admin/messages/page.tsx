import type { Metadata } from "next";
import { StatusPill } from "@/components/status-pill";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const supabase = await createClient();
  const [{ data: messages }, { data: inquiries }] = await Promise.all([
    supabase.from("stayora_messages").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("stayora_inquiries").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-5xl">Messages</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Emails go through Resend and texts through Taysend. If a key is missing, the attempt is stored here as not configured so you can see the exact note that would have been sent.
        </p>
        <div className="mt-6 space-y-3">
          {(messages ?? []).map((message) => (
            <article key={message.id} className="rounded-[24px] bg-paper p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium capitalize">{message.channel} · {message.provider} · {message.recipient}</p>
                <StatusPill status={message.status.includes("not_configured") ? "pending" : message.status === "sent" || message.status === "queued" || message.status === "QUEUED" ? "confirmed" : "pending"} />
              </div>
              {message.subject ? <p className="mt-2 text-sm">{message.subject}</p> : null}
              <p className="mt-2 text-sm leading-6 text-muted">{message.body}</p>
              <p className="mt-2 text-xs text-muted">{formatDate(message.created_at)} · {message.status}</p>
            </article>
          ))}
          {!messages?.length ? <p className="text-sm text-muted">No emails or texts have been attempted yet.</p> : null}
        </div>
      </section>
      <section>
        <h2 className="font-serif text-3xl">Desk enquiries</h2>
        <div className="mt-4 space-y-3">
          {(inquiries ?? []).map((note) => (
            <article key={note.id} className="rounded-[24px] bg-paper p-4">
              <p className="font-medium">{note.name} · {note.topic || "General"}</p>
              <p className="text-xs text-muted">{note.email}{note.phone ? ` · ${note.phone}` : ""} · {formatDate(note.created_at)}</p>
              <p className="mt-2 text-sm leading-6">{note.message}</p>
            </article>
          ))}
          {!inquiries?.length ? <p className="text-sm text-muted">The contact form is quiet.</p> : null}
        </div>
      </section>
    </div>
  );
}
