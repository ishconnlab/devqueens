export const SITE_URL = "https://devqueens.ishconnect.rw";

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

function setMeta(attribute: "name" | "property", key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = value;
}

export function updateSeo({ title, description, path, image = `${SITE_URL}/og-image.png`, noIndex = false }: SeoOptions) {
  const canonicalUrl = `${SITE_URL}${path ?? window.location.pathname}`;
  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
  setMeta("property", "og:site_name", "DevQueens");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:url", canonicalUrl);
  setMeta("property", "og:image", image);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", image);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = canonicalUrl;
}
