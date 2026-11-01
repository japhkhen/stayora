import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { experiences } from "@/lib/content";

export const metadata: Metadata = {
  title: "Experiences",
  description: "Manhyia Palace, Bonwire kente, Lake Bosomtwe, and Kejetia with a Stayora guide.",
};

export default function ExperiencesPage() {
  return (
    <>
      <PageHero
        eyebrow="Kumasi"
        title="The city, with the driving already sorted."
        copy="Tell the desk the night before. Cars leave after breakfast and the kitchen packs water, fruit, and something salty for the road."
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 md:grid-cols-2">
        {experiences.map((item) => (
          <article key={item.title} className="overflow-hidden rounded-[28px] bg-paper card-shadow">
            <div className="relative aspect-[16/10]">
              <Image src={item.image} alt={item.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-gold-deep">{item.time}</p>
              <h2 className="mt-2 font-serif text-3xl">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{item.copy}</p>
            </div>
          </article>
        ))}
      </section>
      <p className="mx-auto max-w-6xl px-4 pb-20 text-sm text-muted sm:px-6">
        These are arranged by the concierge and paid separately from the room.{" "}
        <Link href="/contact" className="text-gold-deep underline-offset-4 hover:underline">Ask the desk</Link> when you book.
      </p>
    </>
  );
}
