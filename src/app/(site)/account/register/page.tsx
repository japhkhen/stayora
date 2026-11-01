import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { one } from "@/lib/format";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = one((await searchParams).next) || "/account";
  return (
    <section className="px-4 py-16">
      <AuthForm mode="register" next={next} />
    </section>
  );
}
