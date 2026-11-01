import type { Metadata } from "next";
import { HomeView } from "@/components/home-view";
import { listFeaturedRooms, listReviews } from "@/lib/hotel";

export const metadata: Metadata = {
  title: "Enjoy modern, elegant accommodations",
  description: "Book a room at Stayora in Ahodwo, Kumasi. Breakfast included, courtyard pool, and mobile-money checkout.",
};

export default async function HomePage() {
  const [rooms, reviews] = await Promise.all([
    listFeaturedRooms().catch(() => []),
    listReviews().catch(() => []),
  ]);
  return <HomeView rooms={rooms} reviews={reviews} />;
}
