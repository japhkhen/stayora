"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveSandbox, cancelGuestStay, payBooking, refreshPayment } from "@/lib/actions";
import { networks } from "@/lib/content";
import { formatGhs } from "@/lib/format";
import type { Booking } from "@/lib/types";

export function PaymentPanel({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(payBooking, null);
  const [channel, setChannel] = useState(booking.channel || "mtn");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, start] = useTransition();
  const payable = booking.status === "pending";

  return (
    <div className="card-shadow rounded-[28px] bg-paper p-6">
      <h2 className="font-serif text-3xl">Pay {formatGhs(booking.total_ghs)}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        {booking.payment_mode === "live"
          ? "A prompt will arrive on the mobile-money number you enter. Approve it to confirm the room."
          : "Sandbox mode is on, so you can walk the whole stay without a live wallet. The same Moolre, Resend, and Taysend paths run when keys are added."}
      </p>
      {payable ? (
        <form action={action} className="mt-6">
          <input type="hidden" name="reference" value={booking.reference} />
          <input type="hidden" name="email" value={booking.guest_email} />
          <input type="hidden" name="channel" value={channel} />
          <div className="grid gap-3">
            {networks.map((network) => (
              <button
                key={network.id}
                type="button"
                onClick={() => setChannel(network.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  channel === network.id ? "border-gold bg-[#fbf6ee]" : "border-line bg-white hover:border-gold"
                }`}
              >
                <span className="block text-sm font-medium text-ink">{network.label}</span>
                <span className="text-xs text-muted">{network.hint}</span>
              </button>
            ))}
          </div>
          <label className="mt-4 block text-sm text-muted">
            Mobile money number
            <input
              name="phone"
              type="tel"
              required
              defaultValue={booking.guest_phone}
              className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold"
            />
          </label>
          {state?.otp ? (
            <label className="mt-4 block text-sm text-muted">
              OTP from Moolre
              <input
                name="otp"
                inputMode="numeric"
                className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold"
              />
            </label>
          ) : null}
          {state?.error || error ? <p className="mt-4 text-sm text-rose-700">{state?.error || error}</p> : null}
          {state?.message || note ? <p className="mt-4 text-sm text-cocoa">{state?.message || note}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="gold-button mt-5 w-full rounded-full py-3 text-sm font-medium disabled:opacity-60"
          >
            {pending ? "Contacting Moolre…" : booking.payment_mode === "live" ? "Send payment prompt" : "Prepare mobile money"}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted">This stay is {booking.status.replaceAll("_", " ")}.</p>
      )}

      {payable && booking.payment_mode === "sandbox" ? (
        <button
          type="button"
          className="mt-3 w-full rounded-full border border-gold px-4 py-3 text-sm text-gold-deep transition hover:bg-[#fbf6ee]"
          disabled={working}
          onClick={() =>
            start(async () => {
              setError(null);
              const result = await approveSandbox(booking.reference, booking.guest_email);
              if (result.error) setError(result.error);
              else {
                setNote(result.message ?? "Confirmed.");
                router.refresh();
              }
            })
          }
        >
          {working ? "Confirming…" : "Approve sandbox payment"}
        </button>
      ) : null}

      {payable && booking.payment_mode === "live" ? (
        <button
          type="button"
          className="mt-3 w-full rounded-full border border-line px-4 py-3 text-sm"
          disabled={working}
          onClick={() =>
            start(async () => {
              setError(null);
              const result = await refreshPayment(booking.reference, booking.guest_email);
              if (result.error) setError(result.error);
              else setNote(result.message ?? "Checked.");
              router.refresh();
            })
          }
        >
          I have approved the prompt
        </button>
      ) : null}

      {booking.status === "pending" || booking.status === "confirmed" ? (
        <button
          type="button"
          className="mt-6 text-sm text-muted underline-offset-4 hover:underline"
          onClick={() =>
            start(async () => {
              const result = await cancelGuestStay(booking.reference, booking.guest_email, "Cancelled by guest");
              if (result.error) setError(result.error);
              else router.refresh();
            })
          }
        >
          Cancel this stay
        </button>
      ) : null}
    </div>
  );
}
