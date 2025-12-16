import Link from "next/link";
import { listCategories } from "../../lib/wiki";

export default async function CategoriesPage() {
  const map = await listCategories();
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return (
    <div>
      <h1>Categories</h1>
      <p className="meta">Browse categories</p>
      <ul>
        {entries.map(([c, count]) => (
          <li key={c}>
            <Link className="link" href={`/categories/${encodeURIComponent(c)}`}>{c}</Link> <span className="meta">({count})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
