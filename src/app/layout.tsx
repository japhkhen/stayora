import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Stayora · Modern hotel in Ahodwo, Kumasi",
    template: "%s · Stayora",
  },
  description:
    "Stayora is a 35-room hotel on Ahodwo Ridge in Kumasi. Reserve a room, pay with mobile money, and arrive to breakfast under the trees.",
  openGraph: {
    title: "Stayora · Kumasi",
    description: "Modern, elegant rooms in Ahodwo, with breakfast, a courtyard pool, and a real front desk.",
    locale: "en_GH",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${outfit.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full bg-ivory text-ink antialiased">{children}</body>
    </html>
  );
}
