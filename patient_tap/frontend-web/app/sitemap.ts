import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";
import { PUBLIC_ROUTES } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${site.legalUpdated}T00:00:00Z`);
  return PUBLIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
