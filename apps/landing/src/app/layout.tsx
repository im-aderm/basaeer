import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from "@/context/NotificationContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Basa'er Schools & Colleges — Quranic Excellence, Academic Distinction",
    template: "%s | Basa'er Schools & Colleges",
  },
  description:
    "Basa'er Quranic & Science College (BQSC) and Basa'er Qur'anic Memorization Schools (BQMS) are endowed Waqf institutions harmonizing Qur'anic mastery with academic excellence, vocational empowerment, and Islamic values across Nigeria.",
  keywords: [
    "Quranic school Nigeria", "Tahfeez", "Hifdh", "Quran memorization", "Islamic school",
    "boarding school Nigeria", "Basaer", "BQSC", "BQMS", "Quranic education",
    "Kaduna", "Kano", "Bauchi", "Plateau", "Waqf school",
  ],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Basa'er Schools & Colleges — Quranic Excellence, Academic Distinction",
    description:
      "Harmonizing Qur'anic mastery with academic excellence. Waqf-endowed institutions across Kaduna, Kano, Bauchi, and Plateau States.",
    siteName: "Basa'er Schools & Colleges",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
        style={{
          '--font-inter': "'Inter', system-ui, -apple-system, sans-serif",
          '--font-space-grotesk': "'Space Grotesk', system-ui, -apple-system, sans-serif",
          '--primary': '#00a0e1',
          '--ring': '#00a0e1',
        } as React.CSSProperties}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <div id="main-content" className="outline-none">
          <NotificationProvider>
            {children}
            <Toaster position="top-center" richColors />
          </NotificationProvider>
        </div>
      </body>
    </html>
  );
}
