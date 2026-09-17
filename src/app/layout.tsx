import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Peta Interaktif Desa Banjaroyo",
  description: "Peta interaktif dengan berbagai titik pada desa Banjaroyo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="min-h-dvh bg-surface text-ink">{children}</body>
    </html>
  );
}
