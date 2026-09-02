import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, defaultDescription } from "@/lib/seo";
import "./globals.css";

// PLACEHOLDER FONTS. Swap when licensed brand typefaces are available.
// Deck substitutes: Newsreader ≈ brand serif wordmark/display;
// IBM Plex Mono ≈ brand mono for body, nav, and labels.
// Exposed to CSS/Tailwind as --font-serif and --font-mono (via globals.css @theme).
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400"],
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
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${newsreader.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-black font-mono">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
