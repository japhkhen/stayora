"use client";

import Link from "next/link";
import { useState } from "react";
import { hotel } from "@/lib/content";
import { Logo } from "@/components/logo";

const links = [
  { href: "/rooms", label: "Rooms" },
  { href: "/dining", label: "Dining" },
  { href: "/experiences", label: "Experiences" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link text-sm text-cocoa/80">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <a href={`tel:${hotel.phones[0].tel}`} className="text-sm text-muted transition hover:text-ink">
            {hotel.phones[0].display}
          </a>
          <Link
            href={signedIn ? "/account" : "/account/login"}
            className="text-sm text-cocoa transition hover:text-ink"
          >
            {signedIn ? "My stay" : "Sign in"}
          </Link>
          <Link
            href="/rooms"
            className="gold-button rounded-full px-5 py-2.5 text-sm font-medium transition duration-300"
          >
            Book your stay
          </Link>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="flex w-4 flex-col gap-1.5">
            <span className={`h-px bg-ink transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`h-px bg-ink transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      {open ? (
        <div className="border-t border-line bg-paper px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-3 text-lg font-serif"
              >
                {link.label}
              </Link>
            ))}
            <Link href={signedIn ? "/account" : "/account/login"} className="rounded-2xl px-3 py-3" onClick={() => setOpen(false)}>
              {signedIn ? "My stay" : "Sign in"}
            </Link>
            <Link
              href="/rooms"
              onClick={() => setOpen(false)}
              className="gold-button mt-2 rounded-full px-5 py-3 text-center text-sm"
            >
              Book your stay
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
