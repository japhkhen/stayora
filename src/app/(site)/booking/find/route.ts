import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = (url.searchParams.get("reference") || "").trim();
  const email = (url.searchParams.get("email") || "").trim();
  redirect(`/booking/${encodeURIComponent(reference)}?email=${encodeURIComponent(email)}`);
}
