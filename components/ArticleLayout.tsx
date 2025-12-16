import { Article } from "../lib/types";
import Infobox from "./Infobox";
import TOC from "./TOC";
import Link from "next/link";
import TagList from "./TagList";
import RelatedArticles from "./RelatedArticles";
import { getPrevNext } from "../lib/wiki";
import React from "react";

export default async function ArticleLayout({ article }: { article: Article }) {
  const headings = Array.from((article.body || "").matchAll(/^##+\s+(.*)$/gm)).map(m => m[1]);
  const html = article.html ?? renderSimpleMarkdown(article.body || "");
  const { prev, next } = await getPrevNext(article.slug);

  const siteUrl = "https://your-site-domain.com"; // replace after deployment
  const canonical = `${siteUrl}/wiki/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description ?? "",
    "datePublished": article.date ?? undefined,
    "author": { "@type": "Person", "name": "Sanatan Wiki" },
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonical }
  };

  return (
    <div className="article-grid">
      <article className="article">
        <h1>{article.title}</h1>
        {article.date && <div className="meta">{article.date}</div>}
        {article.description && <p className="meta">{article.description}</p>}

        <div dangerouslySetInnerHTML={{ __html: html }} />

        <div style={{ marginTop: 12 }}>
          <strong>Categories:</strong>{" "}
          {article.categories?.map(c => <Link key={c} href={`/categories/${encodeURIComponent(c)}`}> {c}</Link>)}
        </div>

        <div style={{ marginTop: 8 }}>
          <TagList tags={article.tags} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          {prev ? <Link className="link" href={`/wiki/${prev.slug}`}>← {prev.title}</Link> : <div />}
          {next ? <Link className="link" href={`/wiki/${next.slug}`}>{next.title} →</Link> : <div />}
        </div>

        <RelatedArticles slug={article.slug} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </article>

      <aside className="sidebar">
        <Infobox info={article.infobox} />
        <div style={{ height: 12 }} />
        <TOC headings={headings} />
      </aside>
    </div>
  );
}

/* Fallback renderer (mirrors lib/wiki.ts) */
function renderSimpleMarkdown(md: string) {
  if (!md) return "";
  const imageRegex = /!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)/g;
  const images: string[] = [];
  let mdWithImageTokens = md.replace(imageRegex, (_m, alt, src, caption) => {
    const token = `@@IMAGE_${images.length}@@`;
    const altEsc = escapeHtml(alt || "");
    const captionEsc = caption ? escapeHtml(caption) : "";
    let fig = `<figure class="article-figure"><img class="article-image" src="${src}" alt="${altEsc}" loading="lazy" decoding="async" />`;
    if (captionEsc) fig += `<figcaption class="article-figcaption">${captionEsc}</figcaption>`;
    fig += `</figure>`;
    images.push(fig);
    return token;
  });

  const lines = mdWithImageTokens.split("\n");
  const out: string[] = [];
  for (let line of lines) {
    if (line.startsWith("### ")) {
      const text = line.replace(/^###\s+/, "");
      out.push(`<h3 id="${slugify(text)}">${escapeHtml(text)}</h3>`);
    } else if (line.startsWith("## ")) {
      const text = line.replace(/^##\s+/, "");
      out.push(`<h2 id="${slugify(text)}">${escapeHtml(text)}</h2>`);
    } else if (line.startsWith("# ")) {
      const text = line.replace(/^#\s+/, "");
      out.push(`<h1 id="${slugify(text)}">${escapeHtml(text)}</h1>`);
    } else if (line.trim() === "") {
      out.push("");
    } else {
      const withLinks = (line || "").replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, href) => {
        const textEsc = escapeHtml(t);
        return `<a className="link" href="${href}">${textEsc}</a>`;
      });
      const escaped = escapeHtml(withLinks)
        .replace(/&lt;a /g, "<a ")
        .replace(/&lt;\/a&gt;/g, "</a>");
      out.push(`<p>${escaped}</p>`);
    }
  }

  let result = out.join("\n");
  images.forEach((html, idx) => {
    result = result.replace(`@@IMAGE_${idx}@@`, html);
  });

  return result;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w]+/g, "-");
}
function escapeHtml(s: string) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          }
