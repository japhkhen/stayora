import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-sm font-semibold text-white shadow-sm">
        S
      </span>
      <span className="font-serif text-[1.65rem] leading-none tracking-tight text-ink">Stayora</span>
    </Link>
  );
}
