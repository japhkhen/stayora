import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { claimAdmin } from "@/lib/actions";
import { adminExists, getProfile } from "@/lib/hotel";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect("/account/login?next=/admin");
  if (profile.role === "guest") {
    const taken = await adminExists();
    return (
      <section className="mx-auto max-w-lg px-4 py-20">
        <h1 className="font-serif text-4xl">Front desk</h1>
        {taken ? (
          <p className="mt-3 text-muted">A manager already looks after Stayora. Ask them to mark your account as staff.</p>
        ) : (
          <>
            <p className="mt-3 text-muted">No manager exists yet. The first signed-in guest can claim the desk.</p>
            <form action={claimAdmin} className="mt-6">
              <button className="gold-button rounded-full px-5 py-3 text-sm">Become the manager</button>
            </form>
          </>
        )}
      </section>
    );
  }
  return <AdminShell profile={profile}>{children}</AdminShell>;
}
