import type { Metadata } from "next";
import ChapterClarity from "@/components/brand-strategy/ChapterClarity";
import ChapterFamiliar from "@/components/brand-strategy/ChapterFamiliar";
import ChapterForYou from "@/components/brand-strategy/ChapterForYou";
import ChapterNav from "@/components/brand-strategy/ChapterNav";
import ChapterStart from "@/components/brand-strategy/ChapterStart";
import ChapterStrategy from "@/components/brand-strategy/ChapterStrategy";
import ChapterUseful from "@/components/brand-strategy/ChapterUseful";
import { pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/what-we-do/brand/brand-strategy";

export const metadata: Metadata = pageMetadata({
  title: "Brand Strategy",
  description:
    "Build a clearer, more distinctive brand with strategy grounded in your business, audience and ambitions. Brand strategy from skapa Creative in Ipswich.",
  path: PATH,
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}${PATH}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "What We Do",
          item: `${SITE_URL}/what-we-do`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Brand Strategy",
          item: `${SITE_URL}${PATH}`,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${PATH}#service`,
      name: "Brand Strategy",
      description:
        "Brand strategy to clarify positioning, audience, difference, personality and messaging — so creative work has a clear reason to exist.",
      url: `${SITE_URL}${PATH}`,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      serviceType: "Brand Strategy",
      areaServed: [
        {
          "@type": "AdministrativeArea",
          name: "Suffolk",
        },
        {
          "@type": "Country",
          name: "United Kingdom",
        },
      ],
    },
  ],
};

export default function BrandStrategyPage() {
  return (
    <div className="bg-bs-offwhite text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ChapterNav />
      <ChapterClarity />
      <ChapterFamiliar />
      <ChapterStrategy />
      <ChapterUseful />
      <ChapterForYou />
      {/* Strategy in practice — insert approved case study / proof here later */}
      <ChapterStart />
    </div>
  );
}
