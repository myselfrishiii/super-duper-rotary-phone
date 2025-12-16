import Link from "next/link";
import { getAllArticles } from "../../lib/wiki";

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  return (
    <div>
      <h1>All Articles</h1>
      <p className="meta">{articles.length} articles</p>
      <ul>
        {articles.map(a => (
          <li key={a.slug}>
            <Link className="link" href={`/wiki/${a.slug}`}>{a.title}</Link> {a.date ? <span className="meta">— {a.date}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
