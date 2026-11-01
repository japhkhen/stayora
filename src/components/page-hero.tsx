export function PageHero({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-6 pt-14 sm:px-6 sm:pt-20">
      <p className="text-xs uppercase tracking-[0.24em] text-gold-deep">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy}</p>
    </section>
  );
}
