import fs from "fs/promises";
import path from "path";
import { Article, ArticleListItem } from "./types";

const PAGES_DIR = path.join(process.cwd(), "content", "pages");
const FEATURED_FILE = path.join(process.cwd(), "content", "featured.json");

// Simple in-memory cache to reduce fs reads on warm server instances (TTL in ms)
const CACHE_TTL = 60 * 1000; // 60s
let cache: {
  timestamp: number;
  articles: Article[] | null;
  featured: string[] | null;
} = {
  timestamp: 0,
  articles: null,
  featured: null,
};

async function readJson<T = any>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

/**
 * Render a small subset of Markdown to HTML:
 * - headings (#, ##, ###)
 * - paragraphs
 * - inline links [text](href)
 * - images ![alt](src "caption") -> <figure><img ... /><figcaption>caption</figcaption></figure>
 */
function renderSimpleMarkdownToHtml(md: string) {
  if (!md) return "";
  // Pattern for images: ![alt](src "optional caption")
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
      // inline links [text](href)
      const withLinks = (line || "").replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, href) => {
        const textEsc = escapeHtml(t);
        return `<a class="link" href="${href}">${textEsc}</a>`;
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

async function loadAllArticlesFromDisk(): Promise<Article[]> {
  try {
    const files = await fs.readdir(PAGES_DIR);
    const articles: Article[] = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (file) => {
          const content = await readJson(path.join(PAGES_DIR, file));
          const slug = content.slug ?? file.replace(/\.json$/i, "");
          const body = content.body ?? "";
          const html = renderSimpleMarkdownToHtml(body);
          return { slug, ...content, body, html } as Article;
        })
    );
    // Sort by date desc if present, otherwise by title
    return articles.sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      return a.title.localeCompare(b.title);
    });
  } catch (err) {
    console.error("Error reading articles:", err);
    return [];
  }
}

async function loadFeaturedFromDisk(): Promise<string[]> {
  try {
    const data = await readJson<string[]>(FEATURED_FILE);
    return data;
  } catch (err) {
    return [];
  }
}

function isCacheFresh() {
  return Date.now() - cache.timestamp < CACHE_TTL && cache.articles !== null;
}

export async function getAllArticles(): Promise<Article[]> {
  if (isCacheFresh()) {
    return cache.articles as Article[];
  }
  const articles = await loadAllArticlesFromDisk();
  cache.articles = articles;
  cache.timestamp = Date.now();
  return articles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await getAllArticles();
  const found = articles.find((a) => a.slug === slug) ?? null;
  return found;
}

export async function listCategories(): Promise<Record<string, number>> {
  const articles = await getAllArticles();
  const map: Record<string, number> = {};
  for (const a of articles) {
    (a.categories || []).forEach((c) => {
      map[c] = (map[c] || 0) + 1;
    });
  }
  return map;
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getAllArticles();
  const set = new Set<string>();
  for (const a of articles) {
    (a.tags || []).forEach((t) => set.add(t));
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export async function getArticlesByCategory(category: string): Promise<ArticleListItem[]> {
  const articles = await getAllArticles();
  return articles
    .filter((a) => (a.categories || []).some((c) => c.toLowerCase() === category.toLowerCase()))
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      description: a.description,
      date: a.date,
      categories: a.categories,
    }));
}

export async function getArticlesByTag(tag: string): Promise<ArticleListItem[]> {
  const articles = await getAllArticles();
  return articles
    .filter((a) => (a.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase()))
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      description: a.description,
      date: a.date,
      categories: a.categories,
    }));
}

export async function getFeatured(): Promise<string[]> {
  if (cache.featured && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.featured;
  }
  const data = await loadFeaturedFromDisk();
  cache.featured = data;
  cache.timestamp = Date.now();
  return data;
}

export async function getFeaturedArticles(): Promise<Article[]> {
  const featured = await getFeatured();
  if (featured.length === 0) return [];
  const all = await getAllArticles();
  const map = new Map(all.map((a) => [a.slug, a]));
  return featured.map((s) => map.get(s)).filter(Boolean) as Article[];
}

export async function searchArticles(q: string): Promise<ArticleListItem[]> {
  const normalized = q.trim().toLowerCase();
  if (!normalized) return [];
  const articles = await getAllArticles();
  const results: ArticleListItem[] = [];
  for (const a of articles) {
    const hay = `${a.title} ${a.description ?? ""} ${a.body} ${(a.tags || []).join(" ")}`
      .toLowerCase();
    if (hay.includes(normalized)) {
      results.push({
        slug: a.slug,
        title: a.title,
        description: a.description,
        date: a.date,
        categories: a.categories,
      });
    }
  }
  return results;
}

/**
 * Related articles by shared tags (preferred) or categories as fallback.
 * Excludes the source slug and limits results.
 */
export async function getRelatedArticles(slug: string, limit = 6): Promise<ArticleListItem[]> {
  const all = await getAllArticles();
  const source = all.find((a) => a.slug === slug);
  if (!source) return [];

  const scores = new Map<string, number>();
  for (const a of all) {
    if (a.slug === slug) continue;
    let score = 0;
    for (const t of a.tags || []) {
      if ((source.tags || []).includes(t)) score += 10;
    }
    for (const c of a.categories || []) {
      if ((source.categories || []).includes(c)) score += 3;
    }
    if (score > 0) scores.set(a.slug, score);
  }

  const sorted = Array.from(scores.entries())
    .sort(([, sa], [, sb]) => sb - sa)
    .slice(0, limit)
    .map(([s]) => all.find((a) => a.slug === s)!) // safe since from all
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      description: a.description,
      date: a.date,
      categories: a.categories,
    }));

  if (sorted.length < limit) {
    const fallback = all
      .filter((a) => a.slug !== slug && !sorted.some((r) => r.slug === a.slug))
      .slice(0, limit - sorted.length)
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        description: a.description,
        date: a.date,
        categories: a.categories,
      }));
    return [...sorted, ...fallback];
  }

  return sorted;
}

/**
 * Prev/Next navigation based on ordering from getAllArticles()
 */
export async function getPrevNext(slug: string): Promise<{ prev?: ArticleListItem | null; next?: ArticleListItem | null }> {
  const all = await getAllArticles();
  const idx = all.findIndex((a) => a.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const toItem = (a?: Article) => a ? { slug: a.slug, title: a.title, description: a.description, date: a.date, categories: a.categories } : null;
  return { prev: toItem(prev) as any, next: toItem(next) as any };
  }
