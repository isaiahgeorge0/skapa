export type CapabilityLink = {
  label: string;
  href?: string;
};

export type ServiceGroup = {
  id: "brand" | "creative" | "digital" | "social";
  number: string;
  name: string;
  proposition: string;
  href: string | null;
  capabilities: CapabilityLink[];
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: "brand",
    number: "01",
    name: "Brand",
    proposition: "A clear idea, then a system people can recognise.",
    href: "/what-we-do/brand",
    capabilities: [
      { label: "Brand Strategy", href: "/what-we-do/brand/brand-strategy" },
      { label: "Brand Identity", href: "/what-we-do/brand/brand-identity" },
      { label: "Rebranding", href: "/what-we-do/brand/rebranding" },
      { label: "Logo Design", href: "/what-we-do/brand/logo-design" },
      { label: "Brand Guidelines", href: "/what-we-do/brand/brand-guidelines" },
    ],
  },
  {
    id: "creative",
    number: "02",
    name: "Creative",
    proposition: "Work that gets noticed because it has a reason to exist.",
    href: null,
    capabilities: [
      { label: "Graphic design" },
      { label: "3D design" },
      { label: "Artworking" },
      { label: "Campaign creative" },
      { label: "Print & digital design" },
      { label: "Marketing materials" },
    ],
  },
  {
    id: "digital",
    number: "03",
    name: "Digital",
    proposition: "Bespoke websites and digital experiences, built with precision.",
    href: null,
    capabilities: [
      { label: "Website design" },
      { label: "Website development" },
      { label: "UI/UX" },
      { label: "Landing pages" },
      { label: "Digital experiences" },
    ],
  },
  {
    id: "social",
    number: "04",
    name: "Social",
    proposition: "Content with rhythm, so the brand stays present.",
    href: null,
    capabilities: [
      { label: "Social media management" },
      { label: "Content creation" },
      { label: "Social strategy" },
      { label: "Campaigns" },
      { label: "Creative direction" },
      { label: "Ongoing brand content" },
    ],
  },
];

export const BRAND_CAPABILITIES = [
  {
    number: "01",
    verb: "Think",
    title: "Brand Strategy",
    href: "/what-we-do/brand/brand-strategy",
    body: "Define what the brand stands for, who it speaks to and why it matters.",
  },
  {
    number: "02",
    verb: "Define",
    title: "Brand Identity",
    href: "/what-we-do/brand/brand-identity",
    body: "Turn the thinking into a distinctive visual and verbal system.",
  },
  {
    number: "03",
    verb: "Create",
    title: "Rebranding",
    href: "/what-we-do/brand/rebranding",
    body: "Evolve an existing brand when the business has moved beyond it.",
  },
  {
    number: "04",
    verb: "Refine",
    title: "Logo Design",
    href: "/what-we-do/brand/logo-design",
    body: "Create a distinctive mark through exploration, reduction and refinement.",
  },
  {
    number: "05",
    verb: "Systemise",
    title: "Brand Guidelines",
    href: "/what-we-do/brand/brand-guidelines",
    body: "Turn the identity into a system everyone can use consistently.",
  },
] as const;

export const BRAND_CHOICES = [
  {
    need: "I know the business, but the brand has no clear direction.",
    title: "Brand Strategy",
    href: "/what-we-do/brand/brand-strategy",
  },
  {
    need: "We need the complete visual identity.",
    title: "Brand Identity",
    href: "/what-we-do/brand/brand-identity",
  },
  {
    need: "We've outgrown our current brand.",
    title: "Rebranding",
    href: "/what-we-do/brand/rebranding",
  },
  {
    need: "We know who we are, but need the right mark.",
    title: "Logo Design",
    href: "/what-we-do/brand/logo-design",
  },
  {
    need: "We have the identity, but people use it inconsistently.",
    title: "Brand Guidelines",
    href: "/what-we-do/brand/brand-guidelines",
  },
] as const;
