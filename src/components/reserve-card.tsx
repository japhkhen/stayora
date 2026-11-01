"use client";

import { useMemo, useState } from "react";
import { defaultStay, formatGhs, nightsBetween } from "@/lib/format";

const stay = defaultStay();

export function ReserveCard({
  slug,
  price,
  maxGuests,
  checkIn = stay.checkIn,
  checkOut = stay.checkOut,
  guests = "2",
  rooms = "1",
}: {
  slug: string;
  price: number;
  maxGuests: number;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  rooms?: string;
}) {
  const [dates, setDates] = useState({ checkIn, checkOut, guests: Number(guests) || 2, rooms: Number(rooms) || 1 });
  const nights = nightsBetween(dates.checkIn, dates.checkOut);
  const total = Math.max(nights, 0) * price * dates.rooms;
  const tooMany = dates.guests > maxGuests * dates.rooms;
  const summary = useMemo(() => {
    if (nights <= 0) return "Choose at least one night.";
    if (tooMany) return "Add another room, or choose a larger suite.";
    return `${nights} night${nights === 1 ? "" : "s"} · breakfast included`;
  }, [nights, tooMany]);

  return (
    <form action="/book" className="card-shadow rounded-[28px] bg-paper p-5">
      <input type="hidden" name="slug" value={slug} />
      <p className="font-serif text-4xl">
        {formatGhs(price)} <span className="font-sans text-sm text-muted">/ night</span>
      </p>
      <div className="mt-5 grid gap-3">
        <label className="text-sm text-muted">
          Check in
          <input
            type="date"
            name="checkIn"
            required
            value={dates.checkIn}
            onChange={(event) => setDates((current) => ({ ...current, checkIn: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold"
          />
        </label>
        <label className="text-sm text-muted">
          Check out
          <input
            type="date"
            name="checkOut"
            required
            value={dates.checkOut}
            onChange={(event) => setDates((current) => ({ ...current, checkOut: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-muted">
            Guests
            <input
              type="number"
              name="guests"
              min={1}
              max={12}
              value={dates.guests}
              onChange={(event) => setDates((current) => ({ ...current, guests: Number(event.target.value) }))}
              className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold"
            />
          </label>
          <label className="text-sm text-muted">
            Rooms
            <select
              name="rooms"
              value={dates.rooms}
              onChange={(event) => setDates((current) => ({ ...current, rooms: Number(event.target.value) }))}
              className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold"
            >
              {[1, 2, 3, 4, 5].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">{summary}</p>
      <p className="mt-1 font-serif text-3xl">{nights > 0 ? formatGhs(total) : formatGhs(price)}</p>
      <button
        type="submit"
        disabled={nights <= 0 || tooMany}
        className="gold-button mt-5 w-full rounded-full py-3 text-sm font-medium transition duration-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Reserve this room
      </button>
      <p className="mt-3 text-center text-xs text-muted">You will confirm guest details and pay with mobile money.</p>
    </form>
  );
}
