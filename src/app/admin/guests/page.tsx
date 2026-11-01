import type { Metadata } from "next";
import { setStaffRole } from "@/lib/actions";
import { getProfile } from "@/lib/hotel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Guests" };

export default async function GuestsPage() {
  const supabase = await createClient();
  const me = await getProfile();
  const [{ data: profiles }, { data: stays }] = await Promise.all([
    supabase.from("stayora_profiles").select("id, full_name, phone, role").order("created_at", { ascending: false }),
    supabase.from("stayora_reservations").select("guest_name, guest_email, guest_phone, status, reference").order("created_at", { ascending: false }),
  ]);

  const byEmail = new Map<string, { name: string; phone: string; stays: number; references: string[] }>();
  for (const stay of stays ?? []) {
    const current = byEmail.get(stay.guest_email) ?? {
      name: stay.guest_name as string,
      phone: stay.guest_phone as string,
      stays: 0,
      references: [] as string[],
    };
    current.stays += 1;
    current.references.push(stay.reference);
    byEmail.set(stay.guest_email, current);
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-5xl">Guests</h1>
        <p className="mt-2 text-sm text-muted">People who have held or confirmed a room, grouped by the email on the booking.</p>
        <div className="mt-6 overflow-x-auto rounded-[24px] bg-paper">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-4 py-3">Name</th><th>Email</th><th>Phone</th><th>Stays</th></tr>
            </thead>
            <tbody>
              {[...byEmail.entries()].map(([email, guest]) => (
                <tr key={email} className="border-t border-line">
                  <td className="px-4 py-3">{guest.name}</td>
                  <td>{email}</td>
                  <td>{guest.phone}</td>
                  <td>{guest.stays}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {byEmail.size === 0 ? <p className="px-4 py-8 text-sm text-muted">No guest stays yet.</p> : null}
        </div>
      </section>
      <section>
        <h2 className="font-serif text-3xl">Accounts</h2>
        <div className="mt-4 space-y-3">
          {(profiles ?? []).map((profile) => (
            <form key={profile.id} action={setStaffRole} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3">
              <div>
                <p className="font-medium">{profile.full_name || "Guest"}</p>
                <p className="text-xs text-muted">{profile.phone || "No phone"} · {profile.role}</p>
              </div>
              {me?.role === "admin" ? (
                <>
                  <input type="hidden" name="user_id" value={profile.id} />
                  <select name="role" defaultValue={profile.role} className="rounded-full border border-line bg-white px-3 py-2 text-sm">
                    <option value="guest">Guest</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Manager</option>
                  </select>
                  <button className="text-sm text-gold-deep">Save role</button>
                </>
              ) : (
                <span className="text-xs text-muted">Managers change roles</span>
              )}
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
