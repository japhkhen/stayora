import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { faqs, hotel } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call Stayora in Kumasi on 0599 873 467 or 0256 206 383, or write to the front desk.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Front desk"
        title="We answer. Even on Sundays."
        copy="For a same-day room, call. For a celebration, a long stay, or a question about a booking you already made, write and the desk will reply."
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-[28px] bg-[#231c18] p-6 text-[#f6f1ea]">
          <p className="font-serif text-3xl">Stayora</p>
          <p className="mt-3 text-sm leading-6 text-white/75">{hotel.address}</p>
          <div className="mt-6 space-y-2 text-sm">
            {hotel.phones.map((phone) => (
              <a key={phone.tel} href={`tel:${phone.tel}`} className="block text-lg hover:text-gold">
                {phone.display}
              </a>
            ))}
            <a href={`mailto:${hotel.email}`} className="block hover:text-gold">{hotel.email}</a>
          </div>
          <p className="mt-6 text-sm text-white/70">Desk open 24 hours · Check-in {hotel.checkIn} · Check-out {hotel.checkOut}</p>
          <a href={hotel.maps} className="mt-6 inline-flex text-sm text-gold underline-offset-4 hover:underline">Get directions</a>
        </aside>
        <ContactForm />
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="font-serif text-4xl">Good to know</h2>
        <div className="mt-6 divide-y divide-line">
          {faqs.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none">
                <span className="flex items-center justify-between gap-4 font-medium">
                  {item.q}
                  <span className="text-gold group-open:rotate-45">+</span>
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
