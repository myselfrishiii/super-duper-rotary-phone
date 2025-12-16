import Link from "next/link";
import { getRelatedArticles } from "../lib/wiki";
import React from "react";

export default async function RelatedArticles({ slug }: { slug: string }) {
  const related = await getRelatedArticles(slug, 6);
  if (!related.length) return null;
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3>Related Articles</h3>
      <ul>
        {related.map(r => (
          <li key={r.slug}><Link className="link" href={`/wiki/${r.slug}`}>{r.title}</Link> {r.date ? <span className="meta">— {r.date}</span> : null}</li>
        ))}
      </ul>
    </div>
  );
}
