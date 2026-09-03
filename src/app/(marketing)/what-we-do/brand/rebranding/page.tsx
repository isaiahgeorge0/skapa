import type { Metadata } from "next";
import ChapterApply from "@/components/brand-rebranding/ChapterApply";
import ChapterChange from "@/components/brand-rebranding/ChapterChange";
import ChapterEvolve from "@/components/brand-rebranding/ChapterEvolve";
import ChapterGap from "@/components/brand-rebranding/ChapterGap";
import ChapterKeepOrChange from "@/components/brand-rebranding/ChapterKeepOrChange";
import ChapterQuestions from "@/components/brand-rebranding/ChapterQuestions";
import ChapterReady from "@/components/brand-rebranding/ChapterReady";
import ChapterReconsider from "@/components/brand-rebranding/ChapterReconsider";
import ChapterResult from "@/components/brand-rebranding/ChapterResult";
import ChapterTransform from "@/components/brand-rebranding/ChapterTransform";
import ChapterWhatChanges from "@/components/brand-rebranding/ChapterWhatChanges";
import RebrandingChapterNav from "@/components/brand-rebranding/RebrandingChapterNav";
import { pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/what-we-do/brand/rebranding";

export const metadata: Metadata = pageMetadata({
  title: "Rebranding",
  description:
    "Rebranding for businesses that have outgrown their existing identity. Clarify what still fits, rethink what no longer works, and build a brand ready for where you are going next. From skapa Creative in Ipswich.",
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
          name: "Brand",
          item: `${SITE_URL}/what-we-do/brand`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Rebranding",
          item: `${SITE_URL}${PATH}`,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${PATH}#service`,
      name: "Rebranding",
      description:
        "Rebranding services that help businesses evolve or transform their brand: strategy, identity, messaging, digital and rollout, shaped around how much change is actually needed.",
      url: `${SITE_URL}${PATH}`,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      serviceType: "Rebranding",
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

export default function RebrandingPage() {
  return (
    <div className="bg-bs-offwhite text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <RebrandingChapterNav />
      <ChapterChange />
      <ChapterGap />
      <ChapterKeepOrChange />
      <ChapterReconsider />
      <ChapterTransform />
      <ChapterApply />
      <ChapterEvolve />
      <ChapterWhatChanges />
      <ChapterResult />
      <ChapterQuestions />
      <ChapterReady />
    </div>
  );
}
