import { toMoolrePayer } from "@/lib/format";

const channels: Record<string, string> = {
  mtn: "13",
  telecel: "6",
  at: "7",
};

export type MoolreBody = {
  status?: number;
  code?: string;
  message?: string;
  data?: {
    txstatus?: number;
    transactionid?: string | null;
    externalref?: string;
    amount?: string;
    secret?: string;
    reason?: string;
  };
};

function configured() {
  return Boolean(
    process.env.MOOLRE_API_USER &&
      process.env.MOOLRE_PUBLIC_KEY &&
      process.env.MOOLRE_ACCOUNT_NUMBER,
  );
}

export function moolreReady() {
  return configured();
}

function baseUrl() {
  return (process.env.MOOLRE_BASE_URL || "https://api.moolre.com").replace(/\/$/, "");
}

async function post(path: string, body: Record<string, unknown>) {
  if (!configured()) {
    throw new Error(
      "Moolre is not configured yet. Add MOOLRE_API_USER, MOOLRE_PUBLIC_KEY, and MOOLRE_ACCOUNT_NUMBER.",
    );
  }
  const response = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-USER": process.env.MOOLRE_API_USER!,
      "X-API-PUBKEY": process.env.MOOLRE_PUBLIC_KEY!,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as MoolreBody;
  if (!response.ok && !payload.message) {
    throw new Error(`Moolre could not be reached (${response.status}).`);
  }
  return payload;
}

export async function initiateMoolre(input: {
  channel: string;
  amount: number;
  phone: string;
  externalRef: string;
  otp?: string;
}) {
  const channel = channels[input.channel];
  if (!channel) throw new Error("Choose MTN, Telecel, or AT.");
  return post("/open/transact/payment", {
    type: 1,
    channel,
    currency: "GHS",
    amount: input.amount,
    payer: toMoolrePayer(input.phone),
    externalref: input.externalRef,
    accountnumber: process.env.MOOLRE_ACCOUNT_NUMBER,
    reference: `Stayora ${input.externalRef}`,
    ...(input.otp ? { otpcode: input.otp } : {}),
  });
}

export async function checkMoolre(externalRef: string) {
  return post("/open/transact/status", {
    type: 1,
    idtype: 1,
    id: externalRef,
    accountnumber: process.env.MOOLRE_ACCOUNT_NUMBER,
  });
}

export function interpretMoolre(body: MoolreBody) {
  const code = (body.code ?? "").toUpperCase();
  const message = (body.message ?? "").toLowerCase();
  const tx = body.data?.txstatus;
  if (code.includes("OTP") || code === "TP14" || message.includes("otp")) {
    return "otp_required" as const;
  }
  if (tx === 1 || code === "P01") return "paid" as const;
  if (tx === 2 || code === "P02" || body.status === 0) return "failed" as const;
  return "processing" as const;
}
