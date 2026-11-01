import Link from "next/link";
import { signOutGuest } from "@/lib/actions";
import type { Profile } from "@/lib/types";

const links = [
  { href: "/admin", label: "Today" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/guests", label: "Guests" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/messages", label: "Messages" },
];

export function AdminShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3eee7]">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link href="/" className="font-serif text-2xl">Stayora desk</Link>
            <p className="text-xs text-muted">{profile.full_name} · {profile.role}</p>
          </div>
          <form action={signOutGuest}>
            <button className="text-sm text-muted">Sign out</button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full bg-ivory px-4 py-2 text-sm text-cocoa hover:bg-gold/30">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
