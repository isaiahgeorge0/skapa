import type { Metadata } from "next";
import BrandOverview from "@/components/what-we-do/BrandOverview";
import { BRAND_CAPABILITIES } from "@/lib/service-groups";
import { pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/what-we-do/brand";

export const metadata: Metadata = pageMetadata({
  title: "Brand",
  description:
    "Branding from skapa Creative in Ipswich: brand strategy, identity, rebranding, logo design and guidelines. Brands with a clear idea and a system people can use, for businesses across Suffolk and the UK.",
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
          item: `${SITE_URL}${PATH}`,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${PATH}#service`,
      name: "Brand",
      description:
        "Branding services covering brand strategy, brand identity, rebranding, logo design and brand guidelines, so businesses have a clear idea and a usable visual system.",
      url: `${SITE_URL}${PATH}`,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      serviceType: "Branding",
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
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Brand services",
        itemListElement: BRAND_CAPABILITIES.map((item) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: item.title,
            url: `${SITE_URL}${item.href}`,
          },
        })),
      },
    },
  ],
};

export default function BrandParentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BrandOverview />
    </>
  );
}
