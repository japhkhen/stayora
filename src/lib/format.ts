export function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function defaultStay() {
  const start = new Date();
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return { checkIn: isoDate(start), checkOut: isoDate(end) };
}

export function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const ms =
    new Date(`${checkOut}T00:00:00`).getTime() -
    new Date(`${checkIn}T00:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

export function formatDate(iso: string) {
  if (!iso) return "";
  const value = iso.length <= 10 ? `${iso}T00:00:00` : iso;
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Accra",
  }).format(new Date(value));
}

export function formatGhs(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRating(value: number) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

export function toIntlGh(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233")) return `+${digits}`;
  if (digits.startsWith("0")) return `+233${digits.slice(1)}`;
  return `+${digits}`;
}

export function toMoolrePayer(phone: string) {
  return toIntlGh(phone).replace("+", "");
}

export function cleanError(message: string) {
  const line = message.split("\n")[0] ?? message;
  return line
    .replace(/^Failed to run sql query:\s*/i, "")
    .replace(/^ERROR:\s*/i, "")
    .trim();
}

export function titleCaseStatus(status: string) {
  return status.replaceAll("_", " ");
}
