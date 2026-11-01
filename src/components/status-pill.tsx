import { titleCaseStatus } from "@/lib/format";

const tones: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  checked_in: "bg-sky-100 text-sky-900",
  checked_out: "bg-stone-200 text-stone-700",
  cancelled: "bg-rose-100 text-rose-800",
  no_show: "bg-rose-100 text-rose-800",
  paid: "bg-emerald-100 text-emerald-900",
  failed: "bg-rose-100 text-rose-800",
  processing: "bg-amber-100 text-amber-900",
  otp_required: "bg-amber-100 text-amber-900",
  refund_due: "bg-orange-100 text-orange-900",
  available: "bg-emerald-100 text-emerald-900",
  occupied: "bg-sky-100 text-sky-900",
  dirty: "bg-amber-100 text-amber-900",
  maintenance: "bg-stone-200 text-stone-700",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs capitalize ${tones[status] ?? "bg-ivory text-cocoa"}`}>
      {titleCaseStatus(status)}
    </span>
  );
}
