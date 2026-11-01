import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { gallery } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Rooms, the pool garden, lounge, and arrival court at Stayora in Ahodwo.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Light timber, white linen, and the garden in between."
        copy="A look through the house before you arrive. The rooms are bright in the morning and quiet after ten."
      />
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 pb-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {gallery.map((photo) => (
          <figure key={photo.label} className="group relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs">{photo.label}</figcaption>
          </figure>
        ))}
      </section>
    </>
  );
}
