export const CHAPTERS = [
  {
    id: "the-idea",
    number: "01",
    label: "The idea",
    short: "Idea",
    accent: "#737373",
  },
  {
    id: "possibilities",
    number: "02",
    label: "Possibilities",
    short: "Explore",
    accent: "#4b4ae4",
  },
  {
    id: "reduction",
    number: "03",
    label: "Reduction",
    short: "Reduce",
    accent: "#111111",
  },
  {
    id: "precision",
    number: "04",
    label: "Precision",
    short: "Detail",
    accent: "#4b4ae4",
  },
  {
    id: "the-test",
    number: "05",
    label: "The test",
    short: "Test",
    accent: "#ff2791",
  },
  {
    id: "what-you-get",
    number: "06",
    label: "What you get",
    short: "Files",
    accent: "#fff1a7",
  },
  {
    id: "logo-or-identity",
    number: "07",
    label: "Logo or identity",
    short: "Scope",
    accent: "#111111",
  },
  {
    id: "the-result",
    number: "08",
    label: "The result",
    short: "Result",
    accent: "#4b4ae4",
  },
  {
    id: "questions",
    number: "09",
    label: "Questions",
    short: "FAQ",
    accent: "#ff2791",
  },
  {
    id: "ready-to-start",
    number: "10",
    label: "Ready to start",
    short: "Start",
    accent: "#ff2791",
  },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];
