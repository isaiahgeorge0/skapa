export const CHAPTERS = [
  {
    id: "find-the-clarity",
    number: "01",
    label: "Find the clarity",
    short: "Clarity",
    accent: "#4b4ae4",
  },
  {
    id: "sound-familiar",
    number: "02",
    label: "Sound familiar?",
    short: "Familiar",
    accent: "#ff2791",
  },
  {
    id: "build-the-strategy",
    number: "03",
    label: "Build the strategy",
    short: "Strategy",
    accent: "#4b4ae4",
  },
  {
    id: "make-it-useful",
    number: "04",
    label: "Make it useful",
    short: "Useful",
    accent: "#fff1a7",
  },
  {
    id: "is-it-for-you",
    number: "05",
    label: "Is it for you?",
    short: "For you",
    accent: "#ff2791",
  },
  {
    id: "start-somewhere",
    number: "06",
    label: "Start somewhere",
    short: "Start",
    accent: "#4b4ae4",
  },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];
