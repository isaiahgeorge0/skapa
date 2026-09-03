import type { Metadata } from "next";

export const SITE_URL = "https://skapa.uk";
export const SITE_NAME = "skapa Creative";

/** Public path for branded OG / Twitter share image. 1200×630px. */
export const OG_IMAGE_PATH: string | null = "/og.jpg";

export const defaultDescription =
  "Ipswich-based creative and digital agency working with businesses across Suffolk and the UK. Branding, bespoke web design, creative and social, all under one roof.";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;

  const openGraphImages = OG_IMAGE_PATH
    ? [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME }]
    : undefined;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
      ...(openGraphImages ? { images: openGraphImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(openGraphImages ? { images: openGraphImages.map((image) => image.url) } : {}),
    },
  };
}

export const noindexNofollow: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const noindexFollow: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};
