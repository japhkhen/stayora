"use client";

import { useActionState } from "react";
import { createReservation } from "@/lib/actions";
import { formatDate, formatGhs } from "@/lib/format";

export function GuestForm({
  slug,
  roomName,
  checkIn,
  checkOut,
  guests,
  rooms,
  nights,
  total,
}: {
  slug: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  rooms: string;
  nights: number;
  total: number;
}) {
  const [state, action, pending] = useActionState(createReservation, null);

  return (
    <form action={action} className="card-shadow rounded-[28px] bg-paper p-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="check_in" value={checkIn} />
      <input type="hidden" name="check_out" value={checkOut} />
      <input type="hidden" name="guests" value={guests} />
      <input type="hidden" name="rooms" value={rooms} />
      <h2 className="font-serif text-3xl">Who is arriving?</h2>
      <p className="mt-2 text-sm text-muted">
        {roomName} · {formatDate(checkIn)} – {formatDate(checkOut)} · {formatGhs(total)} for {nights}{" "}
        {nights === 1 ? "night" : "nights"}
      </p>
      <div className="mt-6 grid gap-4">
        <Field label="Full name" name="guest_name" placeholder="Ama Mensah" autoComplete="name" />
        <Field label="Email" name="guest_email" type="email" placeholder="ama@email.com" autoComplete="email" />
        <Field label="Mobile number" name="guest_phone" type="tel" placeholder="024 000 0000" autoComplete="tel" />
        <label className="text-sm text-muted">
          Special requests
          <textarea
            name="requests"
            rows={4}
            maxLength={500}
            placeholder="A high floor, a late arrival, or a airport pickup."
            className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold"
          />
        </label>
      </div>
      {state?.error ? <p className="mt-4 text-sm text-rose-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="gold-button mt-6 w-full rounded-full py-3 text-sm font-medium transition disabled:opacity-60"
      >
        {pending ? "Holding the room…" : "Hold room and continue to payment"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <label className="text-sm text-muted">
      {label}
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold"
      />
    </label>
  );
}
