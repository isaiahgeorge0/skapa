import {
  Big_Shoulders,
  DM_Sans,
  Fraunces,
  Instrument_Sans,
  Instrument_Serif,
  Nunito_Sans,
  Space_Grotesk,
  Tinos,
} from "next/font/google";

// Loaded only by the work routes, not the root layout.
const yardDisplay = Big_Shoulders({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const yardBody = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const yardAccent = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});
const flowersDisplay = Fraunces({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const flowersBody = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
// Times New Roman is not on Google Fonts. Tinos is the closest match.
const blueDisplay = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});
const blueBody = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const wiskDisplay = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const clientFontClass: Record<string, { display: string; body: string; accent?: string }> = {
  "yard-kitchen": { display: yardDisplay.className, body: yardBody.className, accent: yardAccent.className },
  "flowers-kitchen": { display: flowersDisplay.className, body: flowersBody.className },
  "blue-peak": { display: blueDisplay.className, body: blueBody.className },
  wisk: { display: wiskDisplay.className, body: "font-sans" },
};
