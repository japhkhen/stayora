export type RoomType = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  long_description: string;
  price_ghs: number;
  max_guests: number;
  size_sqm: number;
  bed_type: string;
  view_name: string;
  amenities: string[];
  images: string[];
  featured: boolean;
  popular: boolean;
  sort_order: number;
  remaining?: number;
};

export type Review = {
  id: string;
  guest_name: string;
  guest_from: string;
  rating: number;
  quote: string;
  stay_label: string;
  featured: boolean;
};

export type Booking = {
  id: string;
  reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guests: number;
  rooms_count: number;
  check_in: string;
  check_out: string;
  nights: number;
  nightly_rate: number;
  total_ghs: number;
  status: string;
  special_requests: string | null;
  room_name: string;
  room_slug: string;
  image: string | null;
  payment_status: string | null;
  payment_mode: string | null;
  external_ref: string | null;
  channel: string | null;
  assigned_rooms: { room_number: string; floor: number }[];
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "guest" | "staff" | "admin";
  email?: string;
};

export type CreatedStay = {
  id: string;
  reference: string;
  external_ref: string;
  total_ghs: number;
  nights: number;
  nightly_rate: number;
  room_name: string;
  mode: "sandbox" | "live";
  guest_email: string;
};
