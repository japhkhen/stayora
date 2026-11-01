import Image from "next/image";
import Link from "next/link";
import { BookingBar } from "@/components/booking-bar";
import { RoomCard } from "@/components/room-card";
import { amenities, experiences, faqs, gallery, heroImage, loungeImage, marquee, storyImage } from "@/lib/content";
import { formatRating } from "@/lib/format";
import type { Review, RoomType } from "@/lib/types";

export function HomeView({ rooms, reviews }: { rooms: RoomType[]; reviews: Review[] }) {
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 4.8;
  const featuredQuote = reviews.find((review) => review.featured) ?? reviews[0];

  return (
    <>
      <section className="relative min-h-[78vh] overflow-hidden">
        <Image
          src={heroImage}
          alt="A bright Stayora bedroom with linen bedding, warm wood, and morning light"
          fill
          priority
          sizes="100vw"
          className="ken object-cover object-[center_42%]"
        />
        <div className="relative mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center justify-center px-4 pb-28 pt-16 text-center">
          <p className="rise text-xs font-[600] uppercase tracking-[0.28em] text-white [text-shadow:0_2px_10px_rgba(28,23,20,0.9)]">Ahodwo · Kumasi</p>
          <h1 className="rise rise-delay mt-4 font-serif text-5xl font-[680] leading-[1.05] text-white [text-shadow:0_2px_12px_rgba(28,23,20,0.85)] sm:text-7xl">
            Enjoy Modern, Elegant Accommodations
          </h1>
          <p className="rise rise-delay-2 mx-auto mt-5 max-w-2xl text-base font-[600] leading-7 text-white [text-shadow:0_2px_10px_rgba(28,23,20,0.9)] sm:text-lg">
            Experience luxury and comfort in our meticulously designed hotel rooms.
          </p>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-20 max-w-5xl px-4 sm:px-6">
        <div className="floaty">
          <BookingBar />
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-5xl text-ink">Discover Your Stay</h2>
          <p className="mt-4 text-muted">
            Explore a new level of comfort within our meticulously designed hotel rooms, from garden kings to the pool villa.
          </p>
        </div>
        {rooms.length ? (
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-muted">Rooms will appear here as soon as the house list is published.</p>
        )}
        <div className="mt-10 text-center">
          <Link href="/rooms" className="text-sm text-gold-deep underline-offset-4 hover:underline">
            See every room
          </Link>
        </div>
      </section>

      <div className="overflow-hidden border-y border-line bg-paper py-4">
        <div className="marquee-track flex w-max gap-10 px-6 text-sm uppercase tracking-[0.18em] text-cocoa/70">
          {[...marquee, ...marquee].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-10">
              {item}
              <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px]">
          <Image
            src={storyImage}
            alt="Soft daylight across a made bed at Stayora"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold-deep">The house</p>
          <h2 className="mt-3 font-serif text-5xl leading-tight text-ink">A ridge above the city, made for slow arrivals.</h2>
          <p className="mt-5 text-lg leading-8 text-muted">
            Stayora is a 35-room house in Ahodwo. Pale timber, ivory plaster, and a courtyard of frangipani. It was built for travellers who want Ashanti hospitality without the noise of Kejetia.
          </p>
          <p className="mt-4 leading-7 text-muted">
            From the desk you can reach Manhyia Palace, the cultural centre, Bonwire, and Lake Bosomtwe. Breakfast is included. The pool is shaded. The rooms smell like clean linen and a little shea.
          </p>
          <Link href="/about" className="gold-button mt-8 inline-flex rounded-full px-6 py-3 text-sm transition duration-300">
            Read our story
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((item) => (
            <article key={item.title} className="rounded-[28px] bg-paper p-6 card-shadow">
              <h3 className="font-serif text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gold-deep">Out of the house</p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Kumasi, arranged for you</h2>
          </div>
          <Link href="/experiences" className="hidden text-sm text-gold-deep underline-offset-4 hover:underline sm:inline">
            All experiences
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {experiences.slice(0, 2).map((item) => (
            <article key={item.title} className="group relative min-h-72 overflow-hidden rounded-[28px]">
              <Image src={item.image} alt={item.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-[#f0d7a8]">{item.time}</p>
                <h3 className="mt-1 font-serif text-3xl">{item.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/85">{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-4 overflow-hidden rounded-[32px] sm:mx-6 lg:mx-auto lg:max-w-6xl">
        <Image src={loungeImage} alt="Stayora lounge with sofas and warm evening light" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[#1a1410]/72" />
        <div className="relative grid min-h-[420px] gap-8 px-6 py-16 text-white sm:px-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-serif text-7xl leading-none sm:text-8xl">{formatRating(average)}</p>
            <p className="mt-3 text-sm text-white/75">{reviews.length} recent guest notes</p>
          </div>
          <div>
            <p className="tracking-[0.3em] text-gold">★★★★★</p>
            <blockquote className="mt-4 font-serif text-3xl leading-snug sm:text-4xl">
              “{featuredQuote?.quote ?? "A truly elevated hotel experience from start to finish."}”
            </blockquote>
            <p className="mt-4 text-sm text-white/75">
              {featuredQuote ? `${featuredQuote.guest_name}, ${featuredQuote.guest_from}` : "Efua Boateng, Accra"}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center font-serif text-5xl">Inside the house</h2>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {gallery.map((photo) => (
            <figure key={photo.label} className="group relative aspect-[4/3] overflow-hidden rounded-[24px]">
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 30vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs text-ink">
                {photo.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-4xl">Before you pack</h2>
          <p className="mt-3 text-muted">The short answers guests ask the desk most often.</p>
        </div>
        <div className="divide-y divide-line">
          {faqs.slice(0, 4).map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none font-medium text-ink">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-gold transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="pt-3 text-sm leading-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
