import Link from "next/link";
import { getArticlesByCategory, listCategories } from "../../../lib/wiki";

type Props = { params: { category: string } };

export async function generateStaticParams() {
  const cats = await listCategories();
  return Object.keys(cats).map((c) => ({ category: c }));
}

export default async function CategoryPage({ params }: Props) {
  const category = params.category;
  const articles = await getArticlesByCategory(category);
  return (
    <div>
      <h1>Category: {category}</h1>
      <p className="meta">{articles.length} articles</p>
      <ul>
        {articles.map(a => (
          <li key={a.slug}><Link className="link" href={`/wiki/${a.slug}`}>{a.title}</Link> {a.date ? <span className="meta">— {a.date}</span> : null}</li>
        ))}
      </ul>
    </div>
  );
}
