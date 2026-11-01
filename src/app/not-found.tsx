import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-gold-deep">404</p>
      <h1 className="mt-3 font-serif text-5xl">This room is not on the plan.</h1>
      <p className="mt-3 text-muted">The page has moved, or the link was typed a little off.</p>
      <Link href="/" className="gold-button mt-6 rounded-full px-6 py-3 text-sm">
        Back to Stayora
      </Link>
    </section>
  );
}
