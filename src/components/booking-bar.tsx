"use client";

import { defaultStay } from "@/lib/format";

const defaults = defaultStay();

export function BookingBar({
  checkIn = defaults.checkIn,
  checkOut = defaults.checkOut,
  guests = "2",
  rooms = "1",
  action = "/rooms",
  hidden,
  submitLabel = "Check Availability",
}: {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  rooms?: string;
  action?: string;
  hidden?: Record<string, string>;
  submitLabel?: string;
}) {
  return (
    <form
      action={action}
      className="card-shadow grid items-end gap-3 rounded-[28px] border border-white/70 bg-white/95 p-3 backdrop-blur sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.7fr_0.7fr_auto] lg:gap-0 lg:p-2"
    >
      {hidden
        ? Object.entries(hidden).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)
        : null}
      <Field label="Check in" name="checkIn" type="date" defaultValue={checkIn} />
      <Field label="Check out" name="checkOut" type="date" defaultValue={checkOut} />
      <Field label="Guests" name="guests" type="number" min={1} max={12} defaultValue={guests} />
      <label className="flex flex-col px-3 py-2">
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Rooms</span>
        <select
          name="rooms"
          defaultValue={rooms}
          className="mt-1 bg-transparent text-base text-ink outline-none"
        >
          {[1, 2, 3, 4, 5].map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="gold-button h-12 rounded-full px-6 text-sm font-medium transition duration-300 lg:mr-1 lg:h-14"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  defaultValue,
  min,
  max,
}: {
  label: string;
  name: string;
  type: string;
  defaultValue: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col border-line px-3 py-2 lg:border-r">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</span>
      <input
        name={name}
        type={type}
        min={min}
        max={max}
        required
        defaultValue={defaultValue}
        className="mt-1 bg-transparent text-base text-ink outline-none"
      />
    </label>
  );
}
