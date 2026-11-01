import type { Metadata } from "next";
import Link from "next/link";
import { signOutGuest } from "@/lib/actions";
import { StatusPill } from "@/components/status-pill";
import { getProfile } from "@/lib/hotel";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatGhs } from "@/lib/format";

export const metadata: Metadata = { title: "My stay" };

export default async function AccountPage() {
  const profile = await getProfile().catch(() => null);
  const supabase = await createClient();
  const { data: stays } = profile
    ? await supabase
        .from("stayora_reservations")
        .select("reference, guest_email, check_in, check_out, status, total_ghs, stayora_room_types(name)")
        .eq("user_id", profile.id)
        .order("check_in", { ascending: false })
    : { data: [] };

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Guest book</p>
          <h1 className="mt-2 font-serif text-5xl">{profile ? `Hello, ${profile.full_name || "guest"}` : "Find a stay"}</h1>
        </div>
        {profile ? (
          <form action={signOutGuest}>
            <button className="rounded-full border border-line px-4 py-2 text-sm">Sign out</button>
          </form>
        ) : (
          <Link href="/account/login" className="gold-button rounded-full px-5 py-2.5 text-sm">Sign in</Link>
        )}
      </div>

      <Lookup />

      <div className="mt-10 space-y-3">
        {(stays ?? []).length === 0 ? (
          <p className="text-muted">{profile ? "No stays are linked to this account yet. New bookings made while you are signed in will land here." : "Sign in to see stays linked to your account, or look one up with the reference."}</p>
        ) : (
          stays?.map((stay) => {
            const room = Array.isArray(stay.stayora_room_types) ? stay.stayora_room_types[0] : stay.stayora_room_types;
            return (
              <Link
                key={stay.reference}
                href={`/booking/${stay.reference}?email=${encodeURIComponent(stay.guest_email)}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-paper p-5 card-shadow transition hover:-translate-y-0.5"
              >
                <div>
                  <p className="font-serif text-2xl">{room?.name ?? "Room"}</p>
                  <p className="text-sm text-muted">{formatDate(stay.check_in)} – {formatDate(stay.check_out)} · {stay.reference}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{formatGhs(stay.total_ghs)}</span>
                  <StatusPill status={stay.status} />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}

function Lookup() {
  return (
    <form action="/booking/find" className="mt-8 grid gap-3 rounded-[28px] bg-paper p-5 sm:grid-cols-[1fr_1fr_auto] card-shadow">
      <input name="reference" required placeholder="STY- reference" className="rounded-2xl border border-line bg-white px-4 py-3" />
      <input name="email" type="email" required placeholder="Email on the booking" className="rounded-2xl border border-line bg-white px-4 py-3" />
      <button className="rounded-full bg-ink px-5 py-3 text-sm text-white" formAction="/booking/find">
        Look up
      </button>
    </form>
  );
}
