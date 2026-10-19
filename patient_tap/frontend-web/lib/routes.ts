/** Every public page — feeds the sitemap and keeps nav/footer links honest. */
export const PUBLIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/verify", priority: 0.9, changeFrequency: "weekly" },
  { path: "/donate", priority: 0.8, changeFrequency: "monthly" },
  { path: "/app", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/security", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refunds", priority: 0.3, changeFrequency: "yearly" },
  { path: "/shipping", priority: 0.3, changeFrequency: "yearly" },
  { path: "/accessibility", priority: 0.3, changeFrequency: "yearly" },
  { path: "/licenses", priority: 0.2, changeFrequency: "yearly" },
] as const;
