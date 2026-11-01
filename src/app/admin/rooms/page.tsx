import type { Metadata } from "next";
import { StatusPill } from "@/components/status-pill";
import { updateRoomStatus } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Rooms" };

export default async function RoomsAdminPage() {
  const supabase = await createClient();
  const { data: rooms } = await supabase
    .from("stayora_rooms")
    .select("id, room_number, floor, status, notes, stayora_room_types(name)")
    .order("room_number");

  return (
    <div>
      <h1 className="font-serif text-5xl">Rooms</h1>
      <p className="mt-2 text-sm text-muted">Housekeeping marks a room clean before the next arrival. Occupied rooms are released at check-out.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {(rooms ?? []).map((room) => {
          const type = Array.isArray(room.stayora_room_types) ? room.stayora_room_types[0] : room.stayora_room_types;
          return (
            <article key={room.id} className="rounded-[24px] bg-paper p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-2xl">{room.room_number}</p>
                  <p className="text-xs text-muted">{type?.name} · floor {room.floor}</p>
                </div>
                <StatusPill status={room.status} />
              </div>
              {room.status !== "occupied" ? (
                <form action={updateRoomStatus} className="mt-3 flex flex-wrap gap-2">
                  <input type="hidden" name="room_id" value={room.id} />
                  <input type="hidden" name="note" value="" />
                  {room.status !== "available" ? <button name="status" value="available" className="rounded-full bg-ink px-3 py-1.5 text-xs text-white">Mark clean</button> : null}
                  {room.status !== "dirty" ? <button name="status" value="dirty" className="rounded-full bg-ivory px-3 py-1.5 text-xs">Needs cleaning</button> : null}
                  {room.status !== "maintenance" ? <button name="status" value="maintenance" className="rounded-full bg-ivory px-3 py-1.5 text-xs">Maintenance</button> : null}
                </form>
              ) : (
                <p className="mt-3 text-xs text-muted">In house. Check the guest out to release it.</p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
