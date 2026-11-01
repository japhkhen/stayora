import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckInForm } from "@/components/check-in-form";
import { StatusPill } from "@/components/status-pill";
import { cancelStaffStay, checkOutStay, deskPayment, markNoShow, saveDeskNote } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatGhs } from "@/lib/format";

export const metadata: Metadata = { title: "Reservation" };

export default async function ReservationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: stay } = await supabase
    .from("stayora_reservations")
    .select("*, stayora_room_types(name)")
    .eq("id", id)
    .maybeSingle();
  if (!stay) notFound();

  const [{ data: payments }, { data: operations }, { data: assigned }, available] = await Promise.all([
    supabase.from("stayora_payments").select("*").eq("reservation_id", id).order("created_at", { ascending: false }),
    supabase.from("stayora_operations").select("*").eq("reservation_id", id).order("created_at", { ascending: false }),
    supabase.from("stayora_reservation_rooms").select("stayora_rooms(room_number, floor)").eq("reservation_id", id),
    stay.status === "confirmed" ? supabase.rpc("stayora_available_rooms", { p_reservation: id }) : Promise.resolve({ data: [] }),
  ]);

  const room = Array.isArray(stay.stayora_room_types) ? stay.stayora_room_types[0] : stay.stayora_room_types;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[28px] bg-paper p-6">
        <Link href="/admin/reservations" className="text-sm text-gold-deep">All reservations</Link>
        <div className="mt-3 flex items-center justify-between gap-3">
          <h1 className="font-serif text-4xl">{stay.guest_name}</h1>
          <StatusPill status={stay.status} />
        </div>
        <p className="mt-1 text-sm text-muted">{stay.reference} · {room?.name}</p>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Stay</dt><dd>{formatDate(stay.check_in)} – {formatDate(stay.check_out)}</dd></div>
          <div><dt className="text-muted">Party</dt><dd>{stay.guests} guests · {stay.rooms_count} room(s)</dd></div>
          <div><dt className="text-muted">Contact</dt><dd>{stay.guest_email}<br />{stay.guest_phone}</dd></div>
          <div><dt className="text-muted">Total</dt><dd>{formatGhs(stay.total_ghs)}</dd></div>
        </dl>
        <p className="mt-4 text-sm">
          Assigned:{" "}
          {(assigned ?? [])
            .map((row) => {
              const item = Array.isArray(row.stayora_rooms) ? row.stayora_rooms[0] : row.stayora_rooms;
              return item?.room_number;
            })
            .filter(Boolean)
            .join(", ") || "not yet"}
        </p>
        {stay.special_requests ? <p className="mt-3 text-sm">Guest note: {stay.special_requests}</p> : null}
        <form action={saveDeskNote} className="mt-6">
          <input type="hidden" name="reservation_id" value={stay.id} />
          <label className="text-sm text-muted">
            Desk note
            <textarea name="note" defaultValue={stay.internal_note ?? ""} rows={3} className="mt-1 w-full rounded-2xl border border-line px-3 py-2" />
          </label>
          <button className="mt-2 text-sm text-gold-deep">Save note</button>
        </form>
      </section>
      <aside className="space-y-4">
        <div className="rounded-[28px] bg-paper p-5">
          <h2 className="font-serif text-2xl">Operations</h2>
          {stay.status === "confirmed" ? (
            <>
              <CheckInForm reservationId={stay.id} needed={stay.rooms_count} rooms={available.data ?? []} />
              {available.error ? <p className="mt-3 text-sm text-rose-700">{available.error.message}</p> : null}
            </>
          ) : null}
          {stay.status === "checked_in" ? (
            <form action={checkOutStay} className="mt-4">
              <input type="hidden" name="reservation_id" value={stay.id} />
              <button className="rounded-full bg-ink px-4 py-2 text-sm text-white">Check out and send to housekeeping</button>
            </form>
          ) : null}
          {stay.status === "pending" ? (
            <form action={deskPayment} className="mt-4 grid gap-2">
              <input type="hidden" name="reservation_id" value={stay.id} />
              <input name="note" placeholder="Cash, card, or transfer note" className="rounded-2xl border border-line px-3 py-2 text-sm" />
              <button className="rounded-full bg-ink px-4 py-2 text-sm text-white">Mark paid at the desk</button>
            </form>
          ) : null}
          {stay.status === "confirmed" ? (
            <form action={markNoShow} className="mt-3">
              <input type="hidden" name="reservation_id" value={stay.id} />
              <button className="text-sm text-muted">Mark no-show</button>
            </form>
          ) : null}
          {stay.status === "pending" || stay.status === "confirmed" ? (
            <form action={cancelStaffStay} className="mt-3">
              <input type="hidden" name="reservation_id" value={stay.id} />
              <input type="hidden" name="reason" value="Cancelled by the desk" />
              <button className="text-sm text-rose-700">Cancel stay</button>
            </form>
          ) : null}
        </div>
        <div className="rounded-[28px] bg-paper p-5">
          <h2 className="font-serif text-2xl">Payments</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(payments ?? []).map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-2">
                <span>{payment.provider} · {payment.mode}</span>
                <StatusPill status={payment.status} />
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] bg-paper p-5">
          <h2 className="font-serif text-2xl">Log</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {(operations ?? []).map((item) => (
              <li key={item.id}>{item.kind.replaceAll("_", " ")} · {item.note}</li>
            ))}
            {!operations?.length ? <li>No desk actions yet.</li> : null}
          </ul>
        </div>
      </aside>
    </div>
  );
}
