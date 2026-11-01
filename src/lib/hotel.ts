import { createClient } from "@/lib/supabase/server";
import type { Booking, Profile, Review, RoomType } from "@/lib/types";

export async function listRoomTypes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stayora_room_types")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as RoomType[];
}

export async function listFeaturedRooms() {
  const rooms = await listRoomTypes();
  const featured = rooms.filter((room) => room.featured);
  return featured.length ? featured : rooms.slice(0, 3);
}

export async function getRoom(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stayora_room_types")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as RoomType | null;
}

export async function searchRooms(
  checkIn: string,
  checkOut: string,
  guests: number,
  rooms: number,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stayora_search_availability", {
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_guests: guests,
    p_rooms: rooms,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as RoomType[];
}

export async function listReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stayora_reviews")
    .select("*")
    .order("featured", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Review[];
}

export async function lookupBooking(reference: string, email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stayora_lookup_booking", {
    p_reference: reference,
    p_email: email,
  });
  if (error) throw new Error(error.message);
  return data as Booking;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  await supabase.rpc("stayora_ensure_profile");
  const { data } = await supabase
    .from("stayora_profiles")
    .select("id, full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return { ...data, email: user.email } as Profile;
}

export async function adminExists() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("stayora_admin_exists");
  return Boolean(data);
}
