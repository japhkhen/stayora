import type { Metadata } from "next";
import Link from "next/link";
import { setPaymentsLive } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { formatGhs } from "@/lib/format";

export const metadata: Metadata = { title: "Front desk" };

export default async function AdminHome() {
  const supabase = await createClient();
  const { data: stats } = await supabase.rpc("stayora_dashboard");
  const { data: settings } = await supabase.from("stayora_settings").select("payments_live").eq("id", 1).maybeSingle();
  const board = (stats ?? {}) as {
    arrivals?: number;
    departures?: number;
    in_house?: number;
    pending?: number;
    dirty_rooms?: number;
    occupancy_pct?: number;
    month_revenue_ghs?: number;
    today?: string;
  };
  const cards = [
    ["Arrivals", board.arrivals ?? 0],
    ["Departures", board.departures ?? 0],
    ["In house", board.in_house ?? 0],
    ["Unpaid holds", board.pending ?? 0],
    ["Rooms to clean", board.dirty_rooms ?? 0],
    ["Occupied", `${board.occupancy_pct ?? 0}%`],
  ];

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">{board.today}</p>
      <h1 className="mt-2 font-serif text-5xl">Today on the ridge</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <article key={String(label)} className="rounded-[24px] bg-paper p-5 card-shadow">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-serif text-4xl">{value}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">Paid this month: {formatGhs(Number(board.month_revenue_ghs ?? 0))}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-[24px] bg-paper p-5">
        <div>
          <p className="font-medium">Moolre payments are {settings?.payments_live ? "live" : "in sandbox"}.</p>
          <p className="text-sm text-muted">Sandbox lets you confirm a stay without a real wallet. Switch to live only after the Moolre keys are in the server environment.</p>
        </div>
        <form action={setPaymentsLive}>
          <input type="hidden" name="live" value={settings?.payments_live ? "false" : "true"} />
          <button className="rounded-full bg-ink px-4 py-2 text-sm text-white">
            {settings?.payments_live ? "Use sandbox" : "Go live"}
          </button>
        </form>
        <Link href="/admin/reservations" className="text-sm text-gold-deep">Open the book</Link>
      </div>
    </div>
  );
}
