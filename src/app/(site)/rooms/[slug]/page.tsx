import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ReserveCard } from "@/components/reserve-card";
import { getRoom } from "@/lib/hotel";
import { one } from "@/lib/format";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoom(slug).catch(() => null);
  if (!room) return { title: "Room" };
  return {
    title: room.name,
    description: room.description,
  };
}

export default async function RoomPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const room = await getRoom(slug).catch(() => null);
  if (!room) notFound();

  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_0.8fr] lg:py-16">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold-deep">{room.view_name}</p>
        <h1 className="mt-2 font-serif text-5xl text-ink sm:text-6xl">{room.name}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{room.long_description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {room.images.map((src, index) => (
            <div key={src} className={`relative overflow-hidden rounded-[28px] ${index === 0 ? "aspect-[16/10] sm:col-span-2" : "aspect-[4/3]"}`}>
              <Image
                src={src}
                alt={`${room.name} photograph ${index + 1} at Stayora Kumasi`}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <dl className="mt-8 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl bg-paper p-4">
            <dt className="text-muted">Sleeps</dt>
            <dd className="mt-1 font-medium">{room.max_guests} guests</dd>
          </div>
          <div className="rounded-2xl bg-paper p-4">
            <dt className="text-muted">Bed</dt>
            <dd className="mt-1 font-medium">{room.bed_type}</dd>
          </div>
          <div className="rounded-2xl bg-paper p-4">
            <dt className="text-muted">Size</dt>
            <dd className="mt-1 font-medium">{room.size_sqm} m²</dd>
          </div>
        </dl>
        <ul className="mt-6 flex flex-wrap gap-2">
          {room.amenities.map((amenity) => (
            <li key={amenity} className="rounded-full bg-paper px-3 py-1.5 text-sm text-cocoa">
              {amenity}
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ReserveCard
          slug={room.slug}
          price={room.price_ghs}
          maxGuests={room.max_guests}
          checkIn={one(query.checkIn) || undefined}
          checkOut={one(query.checkOut) || undefined}
          guests={one(query.guests) || undefined}
          rooms={one(query.rooms) || undefined}
        />
      </div>
    </article>
  );
}
