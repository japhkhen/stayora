import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { dining } from "@/lib/content";

export const metadata: Metadata = {
  title: "Dining",
  description: "Breakfast in the courtyard, dinner at Ember, and sunset drinks at Palm Bar. Stayora, Kumasi.",
};

export default function DiningPage() {
  return (
    <>
      <PageHero
        eyebrow="Kitchen"
        title="Eat in the garden, then stay for the grill."
        copy="Breakfast is included with every room. Dinner is short, cooked to order, and happy to be Ghanaian without making a speech about it."
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6">
        {dining.map((place, index) => (
          <article key={place.name} className={`grid items-center gap-6 overflow-hidden rounded-[32px] bg-paper card-shadow md:grid-cols-2 ${index % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
            <div className="relative min-h-72">
              <Image src={place.image} alt={`${place.name} at Stayora`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-6 sm:p-10">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">{place.meal}</p>
              <h2 className="mt-2 font-serif text-4xl">{place.name}</h2>
              <p className="mt-4 leading-7 text-muted">{place.copy}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
