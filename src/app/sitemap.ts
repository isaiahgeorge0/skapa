import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const INDEXABLE_PATHS = [
  "/",
  "/about",
  "/what-we-do",
  "/what-we-do/brand",
  "/what-we-do/brand/brand-strategy",
  "/what-we-do/brand/brand-identity",
  "/what-we-do/brand/rebranding",
  "/what-we-do/brand/logo-design",
  "/what-we-do/brand/brand-guidelines",
  "/work",
  "/contact",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_PATHS.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
  }));
}
