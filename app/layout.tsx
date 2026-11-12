import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SITE } from "@/content/site";
import "./globals.css";

// Font otomatis di-host oleh Next.js. Variabel CSS-nya dipakai di komponen
// lewat font-[family-name:var(--font-inter)] dan var(--font-mono).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const TITLE = `${SITE.name} — ${SITE.role}`;

export const metadata: Metadata = {
  // Alamat situs setelah online; dipakai untuk link gambar pratinjau yang lengkap.
  metadataBase: SITE.url ? new URL(SITE.url) : undefined,
  title: TITLE,
  description: SITE.tagline,
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    title: TITLE,
    description: SITE.tagline,
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE.tagline,
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: skrip intro (app/page.tsx) memasang atribut
    // data-intro di <html> sebelum React berjalan.
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      {/* Variabel font dipasang di <body>, bukan <html>, supaya tidak bentrok
          dengan variabel tema Tailwind yang ditulis di :root. */}
      <body className={`${inter.variable} ${mono.variable} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
