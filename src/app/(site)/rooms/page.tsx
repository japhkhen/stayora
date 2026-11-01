import type { Metadata } from "next";
import { BookingBar } from "@/components/booking-bar";
import { PageHero } from "@/components/page-hero";
import { RoomCard } from "@/components/room-card";
import { listRoomTypes, searchRooms } from "@/lib/hotel";
import { cleanError, defaultStay, one } from "@/lib/format";

export const metadata: Metadata = {
  title: "Rooms",
  description: "Garden rooms, deluxe kings, the Ashanti Suite, and a pool villa at Stayora in Kumasi.",
};

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const defaults = defaultStay();
  const checkIn = one(params.checkIn) || defaults.checkIn;
  const checkOut = one(params.checkOut) || defaults.checkOut;
  const guests = one(params.guests) || "2";
  const roomsCount = one(params.rooms) || "1";
  const hasSearch = Boolean(one(params.checkIn) && one(params.checkOut));
  const query = new URLSearchParams({ checkIn, checkOut, guests, rooms: roomsCount }).toString();

  let rooms = await listRoomTypes().catch(() => []);
  let notice = "";
  if (hasSearch) {
    try {
      const available = await searchRooms(checkIn, checkOut, Number(guests), Number(roomsCount));
      const remaining = new Map(available.map((room) => [room.slug, room.remaining]));
      rooms = rooms.map((room) => ({ ...room, remaining: remaining.get(room.slug) ?? 0 }));
    } catch (error) {
      notice = error instanceof Error ? cleanError(error.message) : "Those dates could not be checked.";
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Rooms & suites"
        title="Choose how you want the city to feel."
        copy="Every rate includes breakfast for two, Wi-Fi, and a room that has actually been thought about. Tell us the dates and we will show what is still open."
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <BookingBar checkIn={checkIn} checkOut={checkOut} guests={guests} rooms={roomsCount} />
        {notice ? <p className="mt-4 text-sm text-rose-700">{notice}</p> : null}
      </div>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} query={query} />
        ))}
      </section>
    </>
  );
}
