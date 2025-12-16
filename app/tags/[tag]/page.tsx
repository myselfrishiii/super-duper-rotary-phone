import Link from "next/link";
import { getArticlesByTag, getAllTags } from "../../../lib/wiki";

type Props = { params: { tag: string } };

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: t }));
}

export default async function TagPage({ params }: Props) {
  const tag = params.tag;
  const articles = await getArticlesByTag(tag);
  return (
    <div>
      <h1>Tag: {tag}</h1>
      <p className="meta">{articles.length} articles</p>
      <ul>
        {articles.map(a => (
          <li key={a.slug}><Link className="link" href={`/wiki/${a.slug}`}>{a.title}</Link> {a.date ? <span className="meta">— {a.date}</span> : null}</li>
        ))}
      </ul>
    </div>
  );
}
