import type { Metadata } from "next";
import Link from "next/link";
import { PaymentPanel } from "@/components/payment-panel";
import { StatusPill } from "@/components/status-pill";
import { lookupBooking } from "@/lib/hotel";
import { cleanError, formatDate, formatGhs, one } from "@/lib/format";

type Props = { params: Promise<{ reference: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = { title: "Your stay" };

export default async function BookingPage({ params, searchParams }: Props) {
  const { reference } = await params;
  const email = one((await searchParams).email);
  if (!email) {
    return (
      <section className="mx-auto max-w-lg px-4 py-20">
        <h1 className="font-serif text-4xl">Find your stay</h1>
        <p className="mt-2 text-sm text-muted">Use the email you booked with and reference {reference}.</p>
        <form className="mt-6 grid gap-3" action={`/booking/${reference}`}>
          <input type="email" name="email" required placeholder="Email" className="rounded-2xl border border-line bg-white px-4 py-3" />
          <button className="gold-button rounded-full py-3 text-sm">Open stay</button>
        </form>
      </section>
    );
  }

  let booking = null;
  let error = "";
  try {
    booking = await lookupBooking(reference, email);
  } catch (caught) {
    error = caught instanceof Error ? cleanError(caught.message) : "Stay not found.";
  }

  if (!booking) {
    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-serif text-4xl">We could not open that stay.</h1>
        <p className="mt-3 text-muted">{error}</p>
        <Link href="/account" className="mt-6 inline-block text-sm text-gold-deep">Try another reference</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] bg-paper p-6 card-shadow">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">{booking.reference}</p>
          <StatusPill status={booking.status} />
        </div>
        <h1 className="mt-3 font-serif text-5xl">{booking.room_name}</h1>
        <p className="mt-2 text-muted">Reserved for {booking.guest_name}</p>
        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Check in</dt><dd className="mt-1 text-lg">{formatDate(booking.check_in)} · 2:00 PM</dd></div>
          <div><dt className="text-muted">Check out</dt><dd className="mt-1 text-lg">{formatDate(booking.check_out)} · 12:00 PM</dd></div>
          <div><dt className="text-muted">Guests / rooms</dt><dd className="mt-1 text-lg">{booking.guests} guests · {booking.rooms_count} room{booking.rooms_count > 1 ? "s" : ""}</dd></div>
          <div><dt className="text-muted">Total</dt><dd className="mt-1 text-lg">{formatGhs(booking.total_ghs)}</dd></div>
        </dl>
        {booking.assigned_rooms?.length ? (
          <p className="mt-6 text-sm">Room {booking.assigned_rooms.map((room) => room.room_number).join(", ")} is ready for you.</p>
        ) : (
          <p className="mt-6 text-sm text-muted">The desk assigns the room number when you arrive, so you get one that was just prepared.</p>
        )}
        {booking.special_requests ? <p className="mt-4 text-sm text-cocoa">Note: {booking.special_requests}</p> : null}
        <p className="mt-8 text-sm leading-6 text-muted">
          Stayora, Ahodwo Ridge, Kumasi. Call 0599 873 467 or 0256 206 383 if your flight changes.
        </p>
      </div>
      <PaymentPanel booking={booking} />
    </section>
  );
}
