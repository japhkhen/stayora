"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerGuest, signInGuest } from "@/lib/actions";

type AuthState = { error?: string; notice?: string } | null;

export function AuthForm({ mode, next = "/account" }: { mode: "login" | "register"; next?: string }) {
  return mode === "login" ? (
    <Card title="Welcome back" copy="Sign in to see upcoming nights and receipts." next={next} mode={mode} action={signInGuest} />
  ) : (
    <Card
      title="Create your stay profile"
      copy="Save your details for the next time you come to Kumasi."
      next={next}
      mode={mode}
      action={registerGuest}
    />
  );
}

function Card({
  title,
  copy,
  next,
  mode,
  action,
}: {
  title: string;
  copy: string;
  next: string;
  mode: "login" | "register";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="card-shadow mx-auto max-w-md rounded-[28px] bg-paper p-6">
      <input type="hidden" name="next" value={next} />
      <h1 className="font-serif text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">{copy}</p>
      <div className="mt-6 grid gap-4">
        {mode === "register" ? (
          <>
            <Field label="Full name" name="name" />
            <Field label="Phone" name="phone" type="tel" />
          </>
        ) : null}
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
      </div>
      {state?.error ? <p className="mt-4 text-sm text-rose-700">{state.error}</p> : null}
      {state?.notice ? <p className="mt-4 text-sm text-cocoa">{state.notice}</p> : null}
      <button disabled={pending} className="gold-button mt-6 w-full rounded-full py-3 text-sm disabled:opacity-60">
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
      <p className="mt-4 text-center text-sm text-muted">
        {mode === "login" ? (
          <Link href={`/account/register?next=${encodeURIComponent(next)}`} className="text-gold-deep">
            Need an account?
          </Link>
        ) : (
          <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="text-gold-deep">
            Already stayed with us?
          </Link>
        )}
      </p>
    </form>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="text-sm text-muted">
      {label}
      <input
        required
        name={name}
        type={type}
        className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-3 text-ink outline-none focus:border-gold"
      />
    </label>
  );
}
