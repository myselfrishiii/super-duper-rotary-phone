import { getArticleBySlug, getAllArticles } from "../../../lib/wiki";
import ArticleLayout from "../../../components/ArticleLayout";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata | undefined> {
  const slug = params.slug;
  const article = await getArticleBySlug(slug);
  if (!article) return;
  const title = `${article.title} — Sanatan Wiki`;
  const description = article.description ?? article.body.slice(0, 140).replace(/\n+/g, " ");
  const url = `https://your-site-domain.com/wiki/${article.slug}`; // replace after deployment
  const image = `https://your-site-domain.com/logo.svg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": description,
    "datePublished": article.date ?? undefined,
    "author": { "@type": "Person", "name": "Sanatan Wiki" },
    "mainEntityOfPage": { "@type": "WebPage", "@id": url }
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Sanatan Wiki",
      images: [{ url: image, width: 800, height: 600, alt: article.title }],
      type: "article",
      publishedTime: article.date
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    alternates: { canonical: url },
    "x-json-ld": jsonLd as any
  } as any;
}

export default async function ArticlePage({ params }: Props) {
  const slug = params.slug;
  const article = await getArticleBySlug(slug);
  if (!article) return notFound();

  return <ArticleLayout article={article} />;
}
