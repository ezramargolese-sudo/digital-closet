import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Digital Closet",
  description: "Your wardrobe, beautifully organized. Outfits in seconds.",
  appleWebApp: { capable: true, title: "Closet", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#190019",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={quicksand.variable}>
      <body className="min-h-dvh bg-cream text-ink">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col">
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
