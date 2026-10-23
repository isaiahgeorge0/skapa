import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import JsonLd from "@/components/JsonLd";
import { OG_IMAGE_PATH, SITE_NAME, SITE_URL, defaultDescription } from "@/lib/seo";
import "./globals.css";

// IBM Plex Sans for headings and body. IBM Plex Mono for labels.
// Exposed to CSS as --font-display and --font-mono (via globals.css @theme).
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_GB",
    type: "website",
    images: OG_IMAGE_PATH
      ? [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME }]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    images: OG_IMAGE_PATH ? [OG_IMAGE_PATH] : undefined,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-display text-black">
        <JsonLd />
        {children}
        {/* Vercel Web Analytics: cookieless, anonymous hashes. Not Speed Insights. */}
        <Analytics />
      </body>
    </html>
  );
}
