import Link from "next/link";
import { hotel } from "@/lib/content";
import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-line bg-[#231c18] text-[#f6f1ea]">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-serif text-3xl">Stayora</p>
          <p className="mt-3 text-sm leading-6 text-[#e7d7c4]/80">
            A quiet house on Ahodwo Ridge. Modern rooms, Ghanaian hospitality, and breakfast under the trees.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Visit</p>
          <p className="mt-3 text-sm leading-6 text-[#f6f1ea]/80">{hotel.address}</p>
          <a href={hotel.maps} className="mt-3 inline-block text-sm text-gold underline-offset-4 hover:underline">
            Open in maps
          </a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Talk to us</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {hotel.phones.map((phone) => (
              <a key={phone.tel} href={`tel:${phone.tel}`} className="hover:text-gold">
                {phone.display}
              </a>
            ))}
            <a href={`mailto:${hotel.email}`} className="hover:text-gold">
              {hotel.email}
            </a>
          </div>
          <p className="mt-4 text-sm text-[#f6f1ea]/70">
            Check-in {hotel.checkIn}
            <br />
            Check-out {hotel.checkOut}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Notes from the house</p>
          <p className="mt-3 text-sm text-[#f6f1ea]/75">Seasonal stays, kente weekends, and the Sunday brunch menu.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-[#f6f1ea]/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Stayora, Kumasi.</p>
          <div className="flex gap-4">
            <Link href="/rooms">Rooms</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/admin">Front desk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
