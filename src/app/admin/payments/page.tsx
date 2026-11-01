import type { Metadata } from "next";
import { StatusPill } from "@/components/status-pill";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatGhs } from "@/lib/format";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stayora_payments")
    .select("id, amount_ghs, provider, mode, channel, status, external_ref, created_at, stayora_reservations(reference, guest_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-5xl">Payments</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Online stays use Moolre mobile money. Sandbox rows can be approved from the guest’s booking page. Desk payments are recorded when a guest pays on arrival.
      </p>
      <div className="mt-6 overflow-x-auto rounded-[24px] bg-paper">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Stay</th>
              <th>Amount</th>
              <th>Rail</th>
              <th>When</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((payment) => {
              const stay = Array.isArray(payment.stayora_reservations) ? payment.stayora_reservations[0] : payment.stayora_reservations;
              return (
                <tr key={payment.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <p>{stay?.guest_name}</p>
                    <p className="text-xs text-muted">{stay?.reference} · {payment.external_ref}</p>
                  </td>
                  <td>{formatGhs(payment.amount_ghs)}</td>
                  <td className="capitalize">{payment.provider} · {payment.mode}{payment.channel ? ` · ${payment.channel}` : ""}</td>
                  <td>{formatDate(payment.created_at)}</td>
                  <td><StatusPill status={payment.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!data?.length ? <p className="px-4 py-8 text-sm text-muted">No payments yet.</p> : null}
      </div>
    </div>
  );
}
