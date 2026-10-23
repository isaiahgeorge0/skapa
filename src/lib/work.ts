export type WorkAccent = "pink" | "yellow" | "blue";
export type Availability = "live" | "launching-soon";

export type ClientTheme = {
  bg: string;
  fg: string;
  accent: string;
  displayFont: string;
  bodyFont: string;
};

export type ClientVoice = {
  headline: string;
  intro: string;
  story: string[];
  approved: boolean;
};

export type ScopeItem = { title: string; line: string };

export type WorkPhoto = { src: string; alt: string; real: true };

export type CaseStudy = {
  slug: string;
  client: string;
  sector: string;
  location: string;
  services: string[];
  summary: string;
  url?: string;
  /** Card badge on /work. The status strip uses `status` below. */
  availability: Availability;
  ownProduct?: boolean;
  accent: WorkAccent;
  /** False while the captures are held back. Tiles then show the branded fallback. */
  captureReady: boolean;
  theme: ClientTheme;
  images: {
    desktop: string;
    mobile: string;
    alt: string;
  };
  brand: {
    logos: { primary: string; onDark: string; mark: string };
    /** Background behind the onDark lock-up. */
    logoTile: string;
    palette: { name: string; hex: string; role: string }[];
    fonts: { display: string; body: string };
    taglines: string[];
    logoIsOurs: boolean;
    guidelines?: { src: string; alt: string }[];
  };
  scope: {
    brand: ScopeItem[];
    website: ScopeItem[];
    behindTheScenes: ScopeItem[];
    stack: string[];
  };
  status: { live: string[]; builtNotLive: string[] };
  photos: WorkPhoto[];
  /** Full-width photo placed between the website and the backstage section. */
  band?: WorkPhoto;
  extraCaptures: { route: string; label: string; src?: string }[];
  backstageTitle: string;
  screens: ("flowers-board" | "flowers-catering" | "blue-dashboard" | "yard-orders" | "wisk-overview")[];
  testimonial?: {
    quote: string;
    name: string;
    role: string;
    approved: boolean;
  };
  voice?: ClientVoice;
};

const flowersGuidelines = [
  ["02-logo-family.webp", "Flowers Kitchen logo family"],
  ["03-colourways.webp", "Flowers Kitchen logo colourways"],
  ["04-colour.webp", "Flowers Kitchen colour"],
  ["05-typography.webp", "Flowers Kitchen typography"],
  ["06-tone-of-voice.webp", "Flowers Kitchen tone of voice"],
  ["07-in-the-world.webp", "Flowers Kitchen guidelines, in the world"],
].map(([file, alt]) => ({
  src: `/images/work/flowers-kitchen/brand/guidelines/${file}`,
  alt,
}));

const blueGuidelines = [
  ["01-logo.webp", "Blue Peak logo"],
  ["02-logo-rules.webp", "Blue Peak logo rules"],
  ["03-wordmark.webp", "Blue Peak wordmark"],
  ["04-colour-palette.webp", "Blue Peak Deep Contour palette"],
  ["05-typography.webp", "Blue Peak typography"],
  ["06-tone-of-voice.webp", "Blue Peak tone of voice"],
  ["07-van-four-routes.webp", "Blue Peak van livery, four routes"],
  ["08-van-gable.webp", "Blue Peak van, the 31 degree gable"],
  ["09-cards-and-email.webp", "Blue Peak cards and email"],
  ["10-closing.webp", "Blue Peak guidelines, closing"],
].map(([file, alt]) => ({
  src: `/images/work/blue-peak/brand/guidelines/${file}`,
  alt,
}));

export const caseStudies: CaseStudy[] = [
  {
    slug: "yard-kitchen",
    client: "Yard Kitchen",
    sector: "Halal Caribbean kitchen",
    location: "Ipswich",
    url: "https://www.yardkitchen.co.uk",
    availability: "live",
    accent: "yellow",
    captureReady: true,
    theme: {
      bg: "#0D1014",
      fg: "#F1EADF",
      accent: "#F0582F",
      displayFont: "Big Shoulders",
      bodyFont: "Instrument Sans",
    },
    services: ["Brand system", "Website", "Menu", "Ordering platform"],
    summary:
      "Halal Caribbean food from Nacton Road. A brand system built from their own badge, a full online menu, and an ordering platform ready to switch on.",
    images: {
      desktop: "/images/work/yard-kitchen/desktop.webp",
      mobile: "/images/work/yard-kitchen/mobile.webp",
      alt: "Yard Kitchen website",
    },
    brand: {
      logos: {
        primary: "/images/work/yard-kitchen/brand/logo-primary.png",
        onDark: "/images/work/yard-kitchen/brand/logo-its-a-ting.jpg",
        mark: "/images/work/yard-kitchen/brand/logo-primary.png",
      },
      logoTile: "#171A1F",
      palette: [
        { name: "Ground", hex: "#0D1014", role: "Page background" },
        { name: "Raised", hex: "#171A1F", role: "Cards" },
        { name: "Ink", hex: "#F1EADF", role: "Text" },
        { name: "Ember", hex: "#F0582F", role: "Accent" },
        { name: "Brass", hex: "#E2B04A", role: "Prices" },
        { name: "Leaf", hex: "#7FB069", role: "Halal tag only" },
      ],
      fonts: { display: "Big Shoulders", body: "Instrument Sans" },
      taglines: ["Big flavour. Yard style.", "It's a ting"],
      logoIsOurs: false,
    },
    scope: {
      brand: [
        { title: "Charcoal brand system", line: "Colours, type and components drawn from their badge." },
        { title: "Brand book", line: "Rules for colour, voice, photography and motion." },
        { title: "Icons and share image", line: "The badge in the browser tab, on a phone, and in a shared link." },
      ],
      website: [
        { title: "Full menu", line: "24 dishes with prices, search and halal tags." },
        { title: "Catering and events", line: "Bookings and pop-ups with their own menus." },
        { title: "Live status", line: "Grill's lit, opening countdown or ordering soon." },
      ],
      behindTheScenes: [
        { title: "Orders board", line: "Orders ring into the kitchen live." },
        { title: "Build-your-own boxes", line: "Meats, sides and paid extras, like ordering at the counter." },
        { title: "Delivery zones", line: "They choose postcodes and prices." },
        { title: "Menu scheduling and staff logins", line: "The team changes the menu and signs in on their own." },
        { title: "Paused mode", line: "The site stays accurate even with ordering off." },
      ],
      stack: ["Next.js", "Supabase", "Stripe", "Vercel"],
    },
    status: {
      live: ["brand system", "homepage", "menu", "catering", "events"],
      builtNotLive: ["online ordering", "delivery", "admin"],
    },
    band: {
      src: "/images/work/yard-kitchen/photos/grill-jerk-chicken.webp",
      alt: "Jerk chicken on the grill",
      real: true,
    },
    photos: [
      { src: "/images/work/yard-kitchen/photos/glazed-jerk-tray.webp", alt: "Glazed jerk chicken in a tray on the grill", real: true },
      { src: "/images/work/yard-kitchen/photos/mac-and-cheese.webp", alt: "Mac and cheese lifted from the pot", real: true },
      { src: "/images/work/yard-kitchen/photos/ackee-in-the-pan.webp", alt: "Ackee and saltfish in the pan", real: true },
      { src: "/images/work/yard-kitchen/photos/box-with-plantain.webp", alt: "A box meal with fried plantain", real: true },
      { src: "/images/work/yard-kitchen/photos/crispy-burger.webp", alt: "A crispy chicken burger", real: true },
      { src: "/images/work/yard-kitchen/photos/plated-rice-and-stew.webp", alt: "Rice, stew and cucumber on a plate", real: true },
      { src: "/images/work/yard-kitchen/photos/crispy-strips.webp", alt: "Crispy chicken strips", real: true },
      { src: "/images/work/yard-kitchen/photos/menu-poster.webp", alt: "The printed Yard Kitchen menu", real: true },
    ],
    extraCaptures: [],
    backstageTitle: "Behind the grill",
    screens: ["yard-orders"],
    testimonial: {
      quote:
        "It finally looks like us. The menu's online and the kitchen side is ready for when we open orders.",
      name: "[Owner name]",
      role: "Yard Kitchen",
      approved: false,
    },
    voice: {
      headline: "Big flavour. Yard style. Now online.",
      intro:
        "We cook halal Caribbean food in Ipswich, Thursday to Saturday. Now the whole menu is online, and ordering is on its way.",
      story: [
        "Before, you found us through Instagram, a phone call or a menu passed round on WhatsApp. The food spoke for itself, but nothing else looked like us.",
        "Now we have a site that does: dark like the grill at night, with our own badge front and centre. The full menu is there every day, and behind it is everything we need to take orders, run the kitchen and manage deliveries ourselves.",
        "We're switching on online ordering soon. When we do, you'll be able to pick your box, pay, and collect it hot from Murrayside.",
      ],
      approved: false,
    },
  },
  {
    slug: "flowers-kitchen",
    client: "Flowers Kitchen",
    sector: "Food and catering",
    location: "Ipswich",
    url: "https://flowerskitchen.co.uk",
    availability: "live",
    accent: "pink",
    // Both viewports still show a box labelled "Photo to follow".
    captureReady: false,
    theme: {
      bg: "#F3EADB",
      fg: "#2B1B16",
      accent: "#8F1D2C",
      displayFont: "Fraunces",
      bodyFont: "DM Sans",
    },
    services: ["Brand identity", "Website", "Online ordering", "Catering"],
    summary:
      "Jamaican family recipes, cooked by the next generation. A brand and ordering site for a halal collection kitchen on St Helen's Street.",
    images: {
      desktop: "/images/work/flowers-kitchen/desktop.webp",
      mobile: "/images/work/flowers-kitchen/mobile.webp",
      alt: "Flowers Kitchen website",
    },
    brand: {
      logos: {
        primary: "/images/work/flowers-kitchen/brand/logo-primary.svg",
        onDark: "/images/work/flowers-kitchen/brand/logo-on-dark.svg",
        mark: "/images/work/flowers-kitchen/brand/mark.svg",
      },
      logoTile: "#1E3A30",
      palette: [
        { name: "Cream", hex: "#F3EADB", role: "Page background" },
        { name: "Paper", hex: "#FBF6EE", role: "Cards" },
        { name: "Pimento", hex: "#2B1B16", role: "Text" },
        { name: "Sorrel", hex: "#8F1D2C", role: "Accent and buttons" },
        { name: "Mountain", hex: "#1E3A30", role: "Second background" },
        { name: "Allspice", hex: "#B9853F", role: "Rules and icons" },
      ],
      fonts: { display: "Fraunces", body: "DM Sans" },
      taglines: ["Jamaican family recipes, cooked by the next generation."],
      logoIsOurs: true,
      guidelines: flowersGuidelines,
    },
    scope: {
      brand: [
        { title: "Logo suite", line: "Five lock-ups in five colourways, from a cup sticker to a shop sign." },
        { title: "Brand guidelines", line: "Colours, type, logo rules and tone, so anyone designing for them gets it right first time." },
      ],
      website: [
        { title: "Menu", line: "Every box and what comes with it, without a phone call." },
        { title: "Paid online ordering", line: "Orders arrive paid and timed, so no no-shows." },
        { title: "Catering builder", line: "A 3D room fills with tables as you plan, with a live estimate." },
        { title: "Our Story and Find Us", line: "The family story, the map, the hours." },
      ],
      behindTheScenes: [
        { title: "Kitchen board", line: "Live orders with timers and Late warnings, built for a Friday rush." },
        { title: "One-tap sold out", line: "Mark rice & peas out once and every box updates." },
        { title: "Catering pipeline", line: "Every enquiry from New to Booked, nothing lost in an inbox." },
        { title: "Refunds and receipts", line: "Cancel, refund and resend from the board." },
        { title: "Staff roles", line: "Owner, Manager and Operations, each with the right access." },
      ],
      stack: ["Next.js", "Supabase", "Stripe", "Resend", "Vercel", "Cloudflare Turnstile", "Three.js"],
    },
    status: {
      live: ["website", "catering enquiries", "admin"],
      builtNotLive: ["online ordering and payments"],
    },
    photos: [
      {
        src: "/images/work/flowers-kitchen/photos/family-kitchen.webp",
        alt: "The Flowers family in their kitchen",
        real: true,
      },
    ],
    extraCaptures: [
      {
        route: "/catering",
        label: "Catering builder",
        src: "/images/work/flowers-kitchen/catering.webp",
      },
    ],
    backstageTitle: "Behind the counter",
    screens: ["flowers-board", "flowers-catering"],
    testimonial: {
      quote: "It finally looks like the business we've built. Proper, proud, and easy to order from.",
      name: "Asher and Tajay",
      role: "Flowers & Sons, Flowers Kitchen",
      approved: false,
    },
    voice: {
      headline: "Our family's recipes, now online.",
      intro:
        "We're Asher and Tajay, cooking the Jamaican recipes our fathers and uncles brought to Ipswich. We wanted a brand and website that look as good as the food tastes.",
      story: [
        "Before, people found us the old way: by word of mouth, by walking past, by a friend bringing them in. The food spoke for itself, but our logo didn't, and there was no way to order ahead or plan an event with us online.",
        "Now we have a name and a look we're proud of, a hibiscus that feels like us, without the clichés. You can order and pay online, choose a collection time, and plan catering for your event, watching the room fill with tables as you go.",
        "Behind the counter, every order lands on our kitchen board, so we can see what's waiting and what's ready, and switch something off the moment it runs out. Same recipes, same care. It's just easier for everyone.",
      ],
      approved: false,
    },
  },
  {
    slug: "blue-peak",
    client: "Blue Peak",
    sector: "Building and renovation",
    location: "Suffolk",
    availability: "launching-soon",
    accent: "blue",
    // The capture shows 01234 567890, a reserved test number. Held back.
    captureReady: false,
    // The live site is near-white. Navy is the brand, so the case study uses that.
    theme: {
      bg: "#0E2240",
      fg: "#FFFFFF",
      accent: "#FFFFFF",
      // The live page asks for Times New Roman, which is not on Google Fonts. Tinos is the closest match.
      displayFont: "Tinos",
      bodyFont: "Nunito Sans",
    },
    services: ["Brand identity", "Van livery", "Website", "Lead tools"],
    summary:
      "A two-founder building firm covering every trade under one roof. A site that explains the work and lets customers build an estimate before they call.",
    images: {
      desktop: "/images/work/blue-peak/desktop.webp",
      mobile: "/images/work/blue-peak/mobile.webp",
      alt: "Blue Peak website",
    },
    brand: {
      logos: {
        primary: "/images/work/blue-peak/brand/logo-white.svg",
        onDark: "/images/work/blue-peak/brand/logo.svg",
        mark: "/images/work/blue-peak/brand/mark-white.svg",
      },
      logoTile: "#FEFEFE",
      palette: [
        { name: "Peak White", hex: "#FEFEFE", role: "Page background on the site" },
        { name: "Frost White", hex: "#E9F7F7", role: "Panels" },
        { name: "Navy", hex: "#0E2240", role: "Text, and this page" },
        { name: "Blue Solution", hex: "#1800AD", role: "Main accent" },
        { name: "Peak Fleet", hex: "#43B7D4", role: "Accent on blue" },
        { name: "Ridge Cyan", hex: "#35DEDE", role: "Highlights" },
      ],
      fonts: { display: "Tinos", body: "Nunito Sans" },
      taglines: ["Everything under one roof.", "One brand. Every skill. One place."],
      logoIsOurs: true,
      guidelines: blueGuidelines,
    },
    scope: {
      brand: [
        { title: "Logo and wordmark", line: "The BP monogram with a mirrored PEAK, made for vans, signs and phones." },
        { title: "The 31 degree pitch", line: "One roof angle runs through photo crops, transitions and the van." },
        { title: "Van livery", line: "Four routes built from the van's own blue, no full wrap needed." },
        { title: "Workwear and cards", line: "One company, on the job and on a card." },
        { title: "Brand and social guidelines", line: "What to post, where and when, without an agency." },
      ],
      website: [
        { title: "3D estimator", line: "Pick the work on a 3D house and get a guide price before calling." },
        { title: "Services and area pages", line: "What they do, and the towns they cover." },
        { title: "Enquiry forms with spam protection", line: "Real enquiries get through. Junk does not." },
      ],
      behindTheScenes: [
        { title: "Lead dashboard", line: "Who needs a reply today, at a glance." },
        { title: "Instant alerts", line: "Email and a phone push the moment a lead lands." },
        { title: "Job references", line: "BP-0001 with a five-stage job card." },
        { title: "Automatic follow-ups", line: "Quote chasers and review requests, without remembering to." },
        { title: "Calendar for site visits", line: "Visits and jobs in one diary, linked to the lead." },
      ],
      stack: ["Next.js", "Supabase", "Resend", "Vercel", "Cloudflare Turnstile", "Three.js"],
    },
    status: {
      live: ["brand", "guidelines", "van livery designs"],
      builtNotLive: ["website and back office"],
    },
    photos: [],
    extraCaptures: [
      { route: "/quote", label: "3D estimator", src: "/images/work/blue-peak/quote.webp" },
    ],
    backstageTitle: "Behind the van",
    screens: ["blue-dashboard"],
    testimonial: {
      quote: "It finally looks like the company we actually are. One name, one team, and every enquiry in one place.",
      name: "Kyle and Steven",
      role: "Co-founders, Blue Peak",
      approved: false,
    },
    voice: {
      headline: "Every trade, finally under one roof.",
      intro:
        "We're Kyle and Steven, and between us we cover just about every job a home needs. Blue Peak is how we brought it all together.",
      story: [
        "Before Blue Peak, we each worked under our own names. The work was good and the reviews said so, but nothing about how we looked online showed that one team could take a job from first visit to final tidy.",
        "We wanted something that looked as finished as our work. Now there's one brand on the van, the shirts and the website. Customers can build a rough estimate on a 3D house before they even call us, and every enquiry lands in one place with a reference number, so nothing slips through.",
        "Now we're getting ready to launch, starting with photographing our own jobs properly. The plan is simple: real jobs, real photos, every week.",
      ],
      approved: false,
    },
  },
  {
    slug: "wisk",
    client: "WISK",
    sector: "Software",
    location: "Ipswich",
    url: "https://wiskapp.com",
    availability: "live",
    ownProduct: true,
    accent: "pink",
    captureReady: true,
    // Own product, so the page uses skapa's tokens rather than the product site's palette.
    theme: {
      bg: "#EFEEEA",
      fg: "#0A0A0A",
      accent: "#FF2791",
      displayFont: "IBM Plex Sans",
      bodyFont: "IBM Plex Sans",
    },
    services: ["Product design", "Web app", "Marketing site"],
    summary:
      "A business command centre for entrepreneurs and landlords, built in-house from idea to a live product with real users.",
    images: {
      desktop: "/images/work/wisk/desktop.webp",
      mobile: "/images/work/wisk/mobile.webp",
      alt: "WISK website",
    },
    brand: {
      logos: {
        primary: "/images/work/wisk/brand/logo-white.svg",
        onDark: "/images/work/wisk/brand/logo-white.svg",
        mark: "/images/work/wisk/brand/mark-white.svg",
      },
      logoTile: "#141B27",
      palette: [
        { name: "Night", hex: "#141B27", role: "Dark background" },
        { name: "White", hex: "#FEFFFE", role: "Light background" },
        { name: "Lime", hex: "#C3FF32", role: "Dark mode only" },
        { name: "Turquoise", hex: "#016C81", role: "Light mode primary" },
        { name: "Lilac", hex: "#ACA0FF", role: "Wordmark on light" },
        { name: "Pink", hex: "#FEA9E0", role: "Section accent" },
      ],
      fonts: { display: "Space Grotesk", body: "System sans" },
      taglines: ["Your business, centralised."],
      logoIsOurs: true,
    },
    scope: {
      brand: [
        { title: "Wordmark and W mark", line: "A rounded wordmark and a W that stands on its own." },
        { title: "Colour system", line: "A colour per section, in light and dark." },
        { title: "Social templates", line: "Carousel and video frames for the product." },
      ],
      website: [
        { title: "Marketing site", line: "wiskapp.com with pricing and the WISK story." },
      ],
      behindTheScenes: [
        { title: "Command centre", line: "Projects, tasks, goals, ideas, leads and content in one place." },
        { title: "Winston", line: "An AI assistant that reads the lot and flags what needs you." },
        { title: "Properties", line: "Rent, repairs, certificates, legal notices and tax summaries for landlords." },
        { title: "Research", line: "Briefs on a lead before every call." },
        { title: "Billing", line: "Stripe plans, add-ons and promo codes." },
      ],
      stack: ["Next.js", "Supabase", "Stripe", "Resend", "Vercel", "Claude API"],
    },
    status: {
      live: ["app.wiskapp.com", "Properties", "Research", "billing"],
      builtNotLive: [],
    },
    photos: [],
    extraCaptures: [],
    backstageTitle: "Under the hood",
    screens: ["wisk-overview"],
    testimonial: {
      quote:
        "I built WISK because my own business lived in six different tools. Now every lead, project and idea sits in one place, and Winston tells me what needs me before I've finished my coffee.",
      name: "Isaiah George",
      role: "Founder, WISK Ltd",
      approved: true,
    },
    voice: {
      headline: "Our own product, built the way we build for clients.",
      intro:
        "WISK is a business command centre for entrepreneurs and landlords: projects, leads, goals and content in one place.",
      story: [
        "We took it from an idea to a live product with real users. Same process, same care, just with ourselves as the client.",
      ],
      approved: true,
    },
  },
];

export const approvedTestimonials = caseStudies.filter(
  (study) => study.testimonial?.approved === true && study.ownProduct !== true,
);

export function visitUrl(study: CaseStudy): string | undefined {
  if (!study.url || study.url.includes("vercel.app")) return undefined;
  return study.url;
}
