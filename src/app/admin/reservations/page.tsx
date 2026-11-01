import type { Metadata } from "next";
import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatGhs, one } from "@/lib/format";

export const metadata: Metadata = { title: "Reservations" };

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const status = one((await searchParams).status);
  const supabase = await createClient();
  let query = supabase
    .from("stayora_reservations")
    .select("id, reference, guest_name, guest_email, check_in, check_out, status, total_ghs, rooms_count, stayora_room_types(name)")
    .order("check_in", { ascending: true });
  if (status) query = query.eq("status", status);
  const { data } = await query;

  const filters = ["", "pending", "confirmed", "checked_in", "checked_out", "cancelled"];

  return (
    <div>
      <h1 className="font-serif text-5xl">Reservations</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((item) => (
          <Link key={item || "all"} href={item ? `/admin/reservations?status=${item}` : "/admin/reservations"} className="rounded-full bg-paper px-3 py-1.5 text-sm capitalize">
            {item || "All"}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[24px] bg-paper">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th>Room</th>
              <th>Dates</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((stay) => {
              const room = Array.isArray(stay.stayora_room_types) ? stay.stayora_room_types[0] : stay.stayora_room_types;
              return (
                <tr key={stay.id} className="border-t border-line">
                  <td className="px-4 py-4">
                    <Link href={`/admin/reservations/${stay.id}`} className="font-medium hover:text-gold-deep">{stay.guest_name}</Link>
                    <p className="text-xs text-muted">{stay.reference}</p>
                  </td>
                  <td>{room?.name}</td>
                  <td>{formatDate(stay.check_in)} – {formatDate(stay.check_out)}</td>
                  <td>{formatGhs(stay.total_ghs)}</td>
                  <td><StatusPill status={stay.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!data?.length ? <p className="px-4 py-8 text-sm text-muted">No stays in this view yet.</p> : null}
      </div>
    </div>
  );
}
