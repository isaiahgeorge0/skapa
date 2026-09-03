import type { Metadata } from "next";
import WhatWeDoExperience from "@/components/what-we-do/WhatWeDoExperience";
import { SERVICE_GROUPS } from "@/lib/service-groups";
import { pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/what-we-do";

export const metadata: Metadata = pageMetadata({
  title: "What We Do",
  description:
    "Brand, creative, digital and social from one Ipswich studio. Strategy, identity, campaigns, websites and content for businesses across Suffolk and the UK.",
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
          item: `${SITE_URL}${PATH}`,
        },
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}${PATH}#services`,
      name: "skapa Creative services",
      itemListElement: SERVICE_GROUPS.map((group, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: group.name,
        description: group.proposition,
        ...(group.href
          ? { url: `${SITE_URL}${group.href}` }
          : { url: `${SITE_URL}${PATH}` }),
      })),
    },
  ],
};

export default function WhatWeDoPage() {
  return (
    <div className="bg-bs-offwhite text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <h1 className="sr-only">
        What we do: Brand, Creative, Digital and Social
      </h1>
      <WhatWeDoExperience />
    </div>
  );
}
