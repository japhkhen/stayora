"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/lib/actions";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  return (
    <form action={action} className="relative mt-4 flex gap-2">
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="Email address"
        className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gold px-4 py-2.5 text-sm text-ink transition hover:bg-[#d7b67e] disabled:opacity-60"
      >
        {pending ? "..." : "Join"}
      </button>
      <span className="sr-only" role="status">
        {state?.ok ? "You are on the list." : state?.error}
      </span>
      {state?.ok ? <p className="absolute mt-14 text-xs text-gold">You are on the list.</p> : null}
    </form>
  );
}
