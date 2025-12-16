export type Article = {
  slug: string;
  title: string;
  description?: string;
  body: string;
  html?: string; // pre-rendered HTML for fast responses
  categories?: string[];
  tags?: string[];
  date?: string;
  infobox?: Record<string, string>;
};

export type ArticleListItem = Pick<Article, "slug" | "title" | "description" | "date" | "categories">;
