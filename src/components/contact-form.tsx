"use client";

import { useActionState } from "react";
import { sendInquiry } from "@/lib/actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendInquiry, null);
  if (state?.ok) {
    return (
      <div className="rounded-[28px] bg-paper p-8 card-shadow">
        <h2 className="font-serif text-3xl">Message received.</h2>
        <p className="mt-3 text-muted">The desk will reply by email. For a same-day arrival, call 0599 873 467.</p>
      </div>
    );
  }
  return (
    <form action={action} className="card-shadow rounded-[28px] bg-paper p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" />
        <Field label="Email" name="email" type="email" />
        <Field label="Phone" name="phone" type="tel" required={false} />
        <label className="text-sm text-muted">
          Topic
          <select name="topic" className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold">
            <option>A new reservation</option>
            <option>An existing stay</option>
            <option>Dining</option>
            <option>A celebration</option>
            <option>Something else</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block text-sm text-muted">
        Message
        <textarea name="message" required minLength={8} rows={5} className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold" />
      </label>
      {state?.error ? <p className="mt-3 text-sm text-rose-700">{state.error}</p> : null}
      <button disabled={pending} className="gold-button mt-5 rounded-full px-6 py-3 text-sm disabled:opacity-60">
        {pending ? "Sending…" : "Send to the desk"}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", required = true }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="text-sm text-muted">
      {label}
      <input required={required} name={name} type={type} className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold" />
    </label>
  );
}
