import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { hotel, storyImage } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Stayora is a 35-room hotel on Ahodwo Ridge in Kumasi, built for unhurried stays.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Stayora"
        title="Hospitality, without the marble trying too hard."
        copy="The house opened for people who like Kumasi and would rather sleep somewhere calm. Thirty-five rooms, a courtyard, and a desk that actually answers the phone."
      />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px]">
          <Image src={storyImage} alt="Morning light in a Stayora bedroom" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
        <div className="space-y-4 text-lg leading-8 text-cocoa/90">
          <p>
            Ahodwo sits on a ridge south of the centre. You can be at Manhyia or the cultural centre in a short drive, then come back to birds and a pool instead of traffic.
          </p>
          <p>
            Rooms are dressed in odum, linen, and brass. Housekeeping turns them in the afternoon. Breakfast is cooked to order. If you land late, the night porter keeps a key and a cold drink.
          </p>
          <p>
            Stayora is locally run. The phones on the website reach the desk: {hotel.phones.map((phone) => phone.display).join(" and ")}.
          </p>
        </div>
      </section>
    </>
  );
}
