import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";
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
  title: {
    default: "skapa Creative",
    template: "%s | skapa Creative",
  },
  description:
    "A UK creative and digital agency. Brand, creative, digital and social, built to create, shape and grow brands.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${newsreader.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-black font-mono">
        {children}
      </body>
    </html>
  );
}
