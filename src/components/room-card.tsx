import Image from "next/image";
import Link from "next/link";
import { formatGhs } from "@/lib/format";
import type { RoomType } from "@/lib/types";

export function RoomCard({
  room,
  query,
}: {
  room: RoomType;
  query?: string;
}) {
  const href = query ? `/rooms/${room.slug}?${query}` : `/rooms/${room.slug}`;
  const soldOut = room.remaining === 0;

  return (
    <article className="card-shadow group flex h-full flex-col rounded-[28px] bg-paper p-3 transition duration-500 hover:-translate-y-1">
      <div className="relative aspect-[5/4] overflow-hidden rounded-[22px]">
        <Image
          src={room.images[0]}
          alt={`${room.name} at Stayora, with ${room.bed_type.toLowerCase()} and ${room.view_name.toLowerCase()}`}
          fill
          sizes="(min-width: 1024px) 24vw, (min-width: 768px) 24vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <h3 className="font-serif text-[1.7rem] leading-none text-ink">{room.name}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{room.description}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-gold-deep">
          {soldOut ? "Sold out for these dates" : room.popular ? "Popular choice" : room.tagline}
        </p>
        <p className="mt-3 font-serif text-3xl text-ink">
          {formatGhs(room.price_ghs)}{" "}
          <span className="font-sans text-sm text-muted">/ night</span>
        </p>
        {typeof room.remaining === "number" && !soldOut ? (
          <p className="mt-1 text-xs text-muted">{room.remaining} left for your dates</p>
        ) : null}
        <div className="mt-5">
          {soldOut ? (
            <span className="inline-flex rounded-full bg-ivory px-5 py-2.5 text-sm text-muted">Unavailable</span>
          ) : (
            <Link
              href={href}
              className="gold-button inline-flex rounded-full px-6 py-2.5 text-sm font-medium transition duration-300"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
