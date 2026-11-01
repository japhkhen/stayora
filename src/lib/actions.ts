"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cleanError } from "@/lib/format";
import { lookupBooking } from "@/lib/hotel";
import { checkMoolre, initiateMoolre, interpretMoolre } from "@/lib/moolre";
import { notifyStay } from "@/lib/notify";
import { createClient } from "@/lib/supabase/server";
import type { CreatedStay } from "@/lib/types";

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

async function applyProviderStatus(input: {
  externalRef: string;
  status: "pending" | "otp_required" | "processing" | "paid" | "failed";
  providerRef?: string | null;
  amount?: number | null;
  raw: unknown;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stayora_apply_payment", {
    p_secret: process.env.STAYORA_WEBHOOK_SECRET ?? "",
    p_external_ref: input.externalRef,
    p_status: input.status,
    p_provider_ref: input.providerRef ?? null,
    p_amount: input.amount ?? null,
    p_raw: input.raw ?? {},
  });
  if (error) throw new Error(cleanError(error.message));
  return data as {
    reference: string;
    email: string;
    guest_name: string;
    phone: string;
    status: string;
    total_ghs: number;
    check_in: string;
    check_out: string;
    duplicate?: boolean;
  };
}

export async function createReservation(_prev: { error?: string } | null, formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stayora_create_reservation", {
    p_slug: field(formData, "slug"),
    p_check_in: field(formData, "check_in"),
    p_check_out: field(formData, "check_out"),
    p_guests: Number(field(formData, "guests") || "1"),
    p_rooms: Number(field(formData, "rooms") || "1"),
    p_guest_name: field(formData, "guest_name"),
    p_guest_email: field(formData, "guest_email"),
    p_guest_phone: field(formData, "guest_phone"),
    p_requests: field(formData, "requests"),
  });
  if (error || !data) return { error: cleanError(error?.message || "The stay could not be held.") };
  const stay = data as CreatedStay;
  const booking = await lookupBooking(stay.reference, stay.guest_email).catch(() => null);
  await notifyStay("hold", {
    id: stay.id,
    reference: stay.reference,
    guest_email: stay.guest_email,
    guest_name: booking?.guest_name,
    guest_phone: booking?.guest_phone,
    room_name: stay.room_name,
    total_ghs: stay.total_ghs,
    check_in: booking?.check_in || field(formData, "check_in"),
    check_out: booking?.check_out || field(formData, "check_out"),
    nights: stay.nights,
  }).catch(() => undefined);
  redirect(`/booking/${stay.reference}?email=${encodeURIComponent(stay.guest_email)}`);
}

export async function payBooking(
  _prev: { error?: string; message?: string; otp?: boolean; ok?: boolean } | null,
  formData: FormData,
) {
  const reference = field(formData, "reference");
  const email = field(formData, "email");
  const channel = field(formData, "channel");
  const phone = field(formData, "phone");
  const otp = field(formData, "otp");
  const supabase = await createClient();
  const attached = await supabase.rpc("stayora_attach_payer", {
    p_reference: reference,
    p_email: email,
    p_channel: channel,
    p_payer_phone: phone,
  });
  if (attached.error) return { error: cleanError(attached.error.message) };
  const payment = attached.data as {
    external_ref: string;
    amount_ghs: number;
    mode: string;
  };
  if (payment.mode === "sandbox") {
    return {
      message:
        "Payments are in sandbox mode, so no mobile-money prompt is sent. Approve the test payment to confirm the stay.",
    };
  }
  try {
    const result = await initiateMoolre({
      channel,
      amount: payment.amount_ghs,
      phone,
      externalRef: payment.external_ref,
      otp: otp || undefined,
    });
    const status = interpretMoolre(result);
    const applied = await applyProviderStatus({
      externalRef: payment.external_ref,
      status,
      providerRef: result.data?.transactionid,
      amount: status === "paid" ? payment.amount_ghs : null,
      raw: result,
    });
    if (status === "paid" && !applied.duplicate) {
      const booking = await lookupBooking(reference, email);
      await notifyStay("confirmed", booking).catch(() => undefined);
      return { ok: true, message: "Payment received. Your stay is confirmed." };
    }
    if (status === "otp_required") {
      return { otp: true, message: result.message || "Enter the code sent to the payer’s phone." };
    }
    if (status === "failed") {
      return { error: result.message || "The payment was declined. You can try again." };
    }
    return {
      message: result.message || "Approve the prompt on your phone, then refresh the payment.",
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Payment could not start." };
  }
}

export async function refreshPayment(reference: string, email: string) {
  const booking = await lookupBooking(reference, email);
  if (!booking.external_ref) return { error: "This stay has no payment to check." };
  if (booking.payment_mode !== "live") {
    return { message: "Sandbox stays are confirmed with the test approval button." };
  }
  try {
    const result = await checkMoolre(booking.external_ref);
    const status = interpretMoolre(result);
    const amount = result.data?.amount != null ? Number(result.data.amount) : null;
    if (result.data?.externalref && result.data.externalref !== booking.external_ref) {
      return { error: "Moolre returned a different reference. The stay was left unchanged." };
    }
    const applied = await applyProviderStatus({
      externalRef: booking.external_ref,
      status: status === "otp_required" ? "processing" : status,
      providerRef: result.data?.transactionid,
      amount: status === "paid" ? amount : null,
      raw: result,
    });
    if (status === "paid" && !applied.duplicate) {
      await notifyStay("confirmed", booking).catch(() => undefined);
    }
    revalidatePath(`/booking/${reference}`);
    return {
      ok: status === "paid",
      message:
        status === "paid"
          ? "Payment received. Your stay is confirmed."
          : status === "failed"
            ? result.message || "The payment did not go through."
            : "Still waiting for approval on the phone.",
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Status check failed." };
  }
}

export async function approveSandbox(reference: string, email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stayora_sandbox_approve", {
    p_reference: reference,
    p_email: email,
  });
  if (error) return { error: cleanError(error.message) };
  await notifyStay("confirmed", data).catch(() => undefined);
  revalidatePath(`/booking/${reference}`);
  return { ok: true, message: "Sandbox payment approved. The stay is confirmed." };
}

export async function cancelGuestStay(reference: string, email: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_guest_cancel", {
    p_reference: reference,
    p_email: email,
    p_reason: reason,
  });
  if (error) return { error: cleanError(error.message) };
  const booking = await lookupBooking(reference, email).catch(() => null);
  if (booking) await notifyStay("cancelled", booking).catch(() => undefined);
  revalidatePath(`/booking/${reference}`);
  return { ok: true };
}

export async function subscribeNewsletter(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_subscribe", { p_email: field(formData, "email") });
  if (error) return { error: cleanError(error.message) };
  return { ok: true };
}

export async function sendInquiry(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_create_inquiry", {
    p_name: field(formData, "name"),
    p_email: field(formData, "email"),
    p_phone: field(formData, "phone"),
    p_topic: field(formData, "topic"),
    p_message: field(formData, "message"),
  });
  if (error) return { error: cleanError(error.message) };
  return { ok: true };
}

export async function registerGuest(_prev: { error?: string; notice?: string } | null, formData: FormData): Promise<{ error?: string; notice?: string } | null> {
  const supabase = await createClient();
  const email = field(formData, "email");
  const password = field(formData, "password");
  const name = field(formData, "name");
  const phone = field(formData, "phone");
  if (password.length < 8) return { error: "Use at least 8 characters for the password." };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, phone } },
  });
  if (error) return { error: error.message };
  if (!data.session) {
    return { notice: "Check your email to confirm the account, then sign in." };
  }
  await supabase.rpc("stayora_ensure_profile");
  redirect(safeNext(field(formData, "next")));
}

export async function signInGuest(_prev: { error?: string; notice?: string } | null, formData: FormData): Promise<{ error?: string; notice?: string } | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });
  if (error) return { error: error.message };
  await supabase.rpc("stayora_ensure_profile");
  redirect(safeNext(field(formData, "next")));
}

export async function signOutGuest() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function claimAdmin() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_claim_admin");
  if (error) throw new Error(cleanError(error.message));
  redirect("/admin");
}

export async function setStaffRole(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_set_role", {
    p_user: field(formData, "user_id"),
    p_role: field(formData, "role"),
  });
  if (error) throw new Error(cleanError(error.message));
  revalidatePath("/admin/guests");
}

export async function setPaymentsLive(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_set_payments_live", {
    p_live: field(formData, "live") === "true",
  });
  if (error) throw new Error(cleanError(error.message));
  revalidatePath("/admin");
}

export async function saveDeskNote(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_set_note", {
    p_reservation: field(formData, "reservation_id"),
    p_note: field(formData, "note"),
  });
  if (error) throw new Error(cleanError(error.message));
  revalidatePath("/admin/reservations");
}

export async function checkInStay(_state: { error?: string } | null, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_check_in", {
    p_reservation: field(formData, "reservation_id"),
    p_room_ids: formData.getAll("room_id"),
  });
  if (error) return { error: cleanError(error.message) };
  revalidatePath("/admin");
  return null;
}

export async function checkOutStay(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_check_out", {
    p_reservation: field(formData, "reservation_id"),
  });
  if (error) throw new Error(cleanError(error.message));
  revalidatePath("/admin");
}

export async function markNoShow(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_mark_no_show", {
    p_reservation: field(formData, "reservation_id"),
  });
  if (error) throw new Error(cleanError(error.message));
  revalidatePath("/admin/reservations");
}

export async function deskPayment(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_desk_payment", {
    p_reservation: field(formData, "reservation_id"),
    p_note: field(formData, "note"),
  });
  if (error) throw new Error(cleanError(error.message));
  revalidatePath("/admin");
}

export async function cancelStaffStay(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_cancel_reservation", {
    p_reservation: field(formData, "reservation_id"),
    p_reason: field(formData, "reason"),
  });
  if (error) throw new Error(cleanError(error.message));
  revalidatePath("/admin");
}

export async function updateRoomStatus(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("stayora_set_room_status", {
    p_room: field(formData, "room_id"),
    p_status: field(formData, "status"),
    p_note: field(formData, "note"),
  });
  if (error) throw new Error(cleanError(error.message));
  revalidatePath("/admin/rooms");
}
