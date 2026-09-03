export const CHAPTERS = [
  {
    id: "it-starts-with-an-idea",
    number: "01",
    label: "It starts with an idea",
    short: "Idea",
    accent: "#737373",
  },
  {
    id: "give-it-form",
    number: "02",
    label: "Give it form",
    short: "Form",
    accent: "#111111",
  },
  {
    id: "give-it-a-voice",
    number: "03",
    label: "Give it a voice",
    short: "Voice",
    accent: "#4b4ae4",
  },
  {
    id: "give-it-personality",
    number: "04",
    label: "Give it personality",
    short: "Colour",
    accent: "#ff2791",
  },
  {
    id: "make-it-a-system",
    number: "05",
    label: "Make it a system",
    short: "System",
    accent: "#4b4ae4",
  },
  {
    id: "make-it-recognisable",
    number: "06",
    label: "Make it recognisable",
    short: "Apply",
    accent: "#fff1a7",
  },
  {
    id: "now-imagine-yours",
    number: "07",
    label: "Now imagine yours",
    short: "Yours",
    accent: "#ff2791",
  },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];
