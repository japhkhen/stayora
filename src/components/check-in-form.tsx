"use client";

import { useActionState, useState } from "react";
import { checkInStay } from "@/lib/actions";

export function CheckInForm({
  reservationId,
  needed,
  rooms,
}: {
  reservationId: string;
  needed: number;
  rooms: { id: string; room_number: string; floor: number }[];
}) {
  const [state, action, pending] = useActionState(checkInStay, null);
  const [picked, setPicked] = useState<string[]>([]);
  function toggle(id: string) {
    setPicked((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= needed) return current;
      return [...current, id];
    });
  }

  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="reservation_id" value={reservationId} />
      {picked.map((id) => (
        <input key={id} type="hidden" name="room_id" value={id} />
      ))}
      <p className="text-sm text-muted">Choose {needed} clean room{needed > 1 ? "s" : ""}.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {rooms.map((room) => (
          <button
            type="button"
            key={room.id}
            onClick={() => toggle(room.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${picked.includes(room.id) ? "bg-ink text-white" : "bg-ivory"}`}
          >
            {room.room_number} · floor {room.floor}
          </button>
        ))}
      </div>
      {!rooms.length ? <p className="mt-3 text-sm text-rose-700">No clean rooms of this type are free.</p> : null}
      {state?.error ? <p className="mt-3 text-sm text-rose-700">{state.error}</p> : null}
      <button disabled={pending || picked.length !== needed} className="mt-4 rounded-full bg-ink px-4 py-2 text-sm text-white disabled:opacity-40">
        {pending ? "Checking in…" : "Check in"}
      </button>
    </form>
  );
}
