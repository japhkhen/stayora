import type { Metadata } from "next";
import Link from "next/link";
import { GuestForm } from "@/components/guest-form";
import { getRoom } from "@/lib/hotel";
import { formatGhs, nightsBetween, one } from "@/lib/format";

export const metadata: Metadata = { title: "Reserve" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const slug = one(params.slug);
  const checkIn = one(params.checkIn);
  const checkOut = one(params.checkOut);
  const guests = one(params.guests) || "2";
  const rooms = one(params.rooms) || "1";
  const room = slug ? await getRoom(slug).catch(() => null) : null;
  const nights = nightsBetween(checkIn, checkOut);

  if (!room || nights <= 0) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Choose a room first.</h1>
        <p className="mt-3 text-muted">Dates and a room are needed before we can hold a stay.</p>
        <Link href="/rooms" className="gold-button mt-6 inline-flex rounded-full px-6 py-3 text-sm">
          Browse rooms
        </Link>
      </section>
    );
  }

  const total = room.price_ghs * nights * Number(rooms);

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.1fr]">
      <aside>
        <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Your hold</p>
        <h1 className="mt-2 font-serif text-5xl">{room.name}</h1>
        <p className="mt-4 text-muted">{room.tagline}</p>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Nightly rate</dt><dd>{formatGhs(room.price_ghs)}</dd></div>
          <div className="flex justify-between"><dt>Nights</dt><dd>{nights}</dd></div>
          <div className="flex justify-between"><dt>Rooms</dt><dd>{rooms}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 font-serif text-2xl"><dt>Total</dt><dd>{formatGhs(total)}</dd></div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted">The desk confirms the final total. A hold lasts 45 minutes while you pay.</p>
      </aside>
      <GuestForm
        slug={room.slug}
        roomName={room.name}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        rooms={rooms}
        nights={nights}
        total={total}
      />
    </section>
  );
}
