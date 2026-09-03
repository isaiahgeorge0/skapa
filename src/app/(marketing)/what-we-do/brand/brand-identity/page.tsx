import type { Metadata } from "next";
import ChapterForm from "@/components/brand-identity/ChapterForm";
import ChapterIdea from "@/components/brand-identity/ChapterIdea";
import ChapterImagine from "@/components/brand-identity/ChapterImagine";
import ChapterPersonality from "@/components/brand-identity/ChapterPersonality";
import ChapterRecognisable from "@/components/brand-identity/ChapterRecognisable";
import ChapterSystem from "@/components/brand-identity/ChapterSystem";
import ChapterVoice from "@/components/brand-identity/ChapterVoice";
import IdentityChapterNav from "@/components/brand-identity/IdentityChapterNav";
import { pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/what-we-do/brand/brand-identity";

export const metadata: Metadata = pageMetadata({
  title: "Brand Identity",
  description:
    "Brand identity design that turns strategy into a recognisable visual system: logo, typography, colour, graphic language and applications. From skapa Creative in Ipswich.",
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
          name: "Brand Identity",
          item: `${SITE_URL}${PATH}`,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${PATH}#service`,
      name: "Brand Identity",
      description:
        "Brand identity design: a complete visual system covering logo, typography, colour, imagery, graphic language and application, so the brand is recognisable wherever it appears.",
      url: `${SITE_URL}${PATH}`,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      serviceType: "Brand Identity Design",
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

export default function BrandIdentityPage() {
  return (
    <div className="bg-bs-offwhite text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <IdentityChapterNav />
      <ChapterIdea />
      <ChapterForm />
      <ChapterVoice />
      <ChapterPersonality />
      <ChapterSystem />
      <ChapterRecognisable />
      <ChapterImagine />
    </div>
  );
}
