import type { Metadata } from "next";
import ChapterCover from "@/components/brand-guidelines/ChapterCover";
import ChapterDeliverables from "@/components/brand-guidelines/ChapterDeliverables";
import ChapterExisting from "@/components/brand-guidelines/ChapterExisting";
import ChapterFlex from "@/components/brand-guidelines/ChapterFlex";
import ChapterQuestions from "@/components/brand-guidelines/ChapterQuestions";
import ChapterReady from "@/components/brand-guidelines/ChapterReady";
import ChapterResult from "@/components/brand-guidelines/ChapterResult";
import ChapterRules from "@/components/brand-guidelines/ChapterRules";
import ChapterSystem from "@/components/brand-guidelines/ChapterSystem";
import ChapterUsers from "@/components/brand-guidelines/ChapterUsers";
import ChapterWhy from "@/components/brand-guidelines/ChapterWhy";
import GuidelinesChapterNav from "@/components/brand-guidelines/GuidelinesChapterNav";
import { pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/what-we-do/brand/brand-guidelines";

export const metadata: Metadata = pageMetadata({
  title: "Brand Guidelines",
  description:
    "Brand guidelines that turn identity decisions into a usable system: logo rules, colour, typography, tone of voice and application. Consistent brand use for teams and partners. From skapa Creative in Ipswich.",
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
          name: "Brand Guidelines",
          item: `${SITE_URL}${PATH}`,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${PATH}#service`,
      name: "Brand Guidelines",
      description:
        "Brand guidelines design covering logo usage, colour palette, typography, imagery, tone of voice and application examples so teams can use a brand consistently.",
      url: `${SITE_URL}${PATH}`,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      serviceType: "Brand Guidelines",
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

export default function BrandGuidelinesPage() {
  return (
    <div className="bg-bs-offwhite text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GuidelinesChapterNav />
      <ChapterSystem />
      <ChapterWhy />
      <ChapterCover />
      <ChapterRules />
      <ChapterFlex />
      <ChapterUsers />
      <ChapterDeliverables />
      <ChapterExisting />
      <ChapterResult />
      <ChapterQuestions />
      <ChapterReady />
    </div>
  );
}
