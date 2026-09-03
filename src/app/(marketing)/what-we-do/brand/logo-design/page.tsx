import type { Metadata } from "next";
import ChapterDeliverables from "@/components/brand-logo-design/ChapterDeliverables";
import ChapterIdea from "@/components/brand-logo-design/ChapterIdea";
import ChapterLogoOrIdentity from "@/components/brand-logo-design/ChapterLogoOrIdentity";
import ChapterPossibilities from "@/components/brand-logo-design/ChapterPossibilities";
import ChapterPrecision from "@/components/brand-logo-design/ChapterPrecision";
import ChapterQuestions from "@/components/brand-logo-design/ChapterQuestions";
import ChapterReady from "@/components/brand-logo-design/ChapterReady";
import ChapterReduction from "@/components/brand-logo-design/ChapterReduction";
import ChapterResult from "@/components/brand-logo-design/ChapterResult";
import ChapterTest from "@/components/brand-logo-design/ChapterTest";
import LogoDesignChapterNav from "@/components/brand-logo-design/LogoDesignChapterNav";
import { pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/what-we-do/brand/logo-design";

export const metadata: Metadata = pageMetadata({
  title: "Logo Design",
  description:
    "Logo design that explores possibilities, then reduces them to a clear, versatile mark. Symbol, wordmark, lockups and files ready for real use. From skapa Creative in Ipswich.",
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
          name: "Logo Design",
          item: `${SITE_URL}${PATH}`,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${PATH}#service`,
      name: "Logo Design",
      description:
        "Logo design services covering exploration, refinement, precision construction, and delivery of versatile marks, lockups and files for digital and print.",
      url: `${SITE_URL}${PATH}`,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      serviceType: "Logo Design",
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

export default function LogoDesignPage() {
  return (
    <div className="bg-bs-offwhite text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LogoDesignChapterNav />
      <ChapterIdea />
      <ChapterPossibilities />
      <ChapterReduction />
      <ChapterPrecision />
      <ChapterTest />
      <ChapterDeliverables />
      <ChapterLogoOrIdentity />
      <ChapterResult />
      <ChapterQuestions />
      <ChapterReady />
    </div>
  );
}
