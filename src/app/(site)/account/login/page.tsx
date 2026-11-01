import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { one } from "@/lib/format";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = one((await searchParams).next) || "/account";
  return (
    <section className="px-4 py-16">
      <AuthForm mode="login" next={next} />
    </section>
  );
}
