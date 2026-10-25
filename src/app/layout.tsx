import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

// Small numeric details only — not worth a preload on the critical path.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const TITLE = "Punarnava — plastic that becomes new again";
const DESCRIPTION =
  "A proposed Bengaluru recycling plant, shown through a clear investor story and an interactive factory walkthrough.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · Punarnava" },
  description: DESCRIPTION,
  applicationName: "Punarnava",
  keywords: ["plastic recycling", "recycled HDPE", "rHDPE pellets", "EPR", "Bengaluru", "circular economy"],
  openGraph: {
    title: TITLE,
    description: "A planned Bengaluru plant for traceable recycled HDPE pellets.",
    url: "/",
    siteName: "Punarnava",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "A planned Bengaluru plant for traceable recycled HDPE pellets.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#14191b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
