import { getAllArticles } from "../../lib/wiki";
import { NextResponse } from "next/server";

export async function GET() {
  const siteUrl = "https://your-site-domain.com"; // replace after deployment
  const articles = await getAllArticles();

  const pages = [
    `${siteUrl}/`,
    `${siteUrl}/articles`,
    `${siteUrl}/categories`,
    `${siteUrl}/search`,
    `${siteUrl}/about`,
  ];

  const articleUrls = articles.map(a => `${siteUrl}/wiki/${a.slug}`);
  const allUrls = [...pages, ...articleUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allUrls.map(url => `<url><loc>${url}</loc></url>`).join("\n")}
  </urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
}
