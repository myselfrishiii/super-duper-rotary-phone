import Link from "next/link";
import { getFeaturedArticles, getAllArticles } from "../lib/wiki";
import Image from "next/image";

export default async function Home() {
  const featured = await getFeaturedArticles();
  const all = await getAllArticles();
  const recent = all.slice(0, 6);

  const hero = featured.length > 0 ? featured[0] : null;
  const restFeatured = featured.slice(1);

  return (
    <div>
      <section style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1>Welcome to Sanatan Wiki</h1>
          <p className="meta">A minimal JSON-driven wiki. Browse featured articles or search the site.</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Image src="/logo.svg" alt="logo" width={64} height={64} />
        </div>
      </section>

      {hero && (
        <section className="card" style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginTop: 0 }}>
              <Link className="link" href={`/wiki/${hero.slug}`}>{hero.title}</Link>
            </h2>
            {hero.description && <p className="meta">{hero.description}</p>}
            <p style={{ marginTop: 12 }}>
              <Link className="link" href={`/wiki/${hero.slug}`}>Read featured article →</Link>
            </p>
          </div>
          <div style={{ minWidth: 200, textAlign: "right" }}>
            <div className="meta">Featured</div>
          </div>
        </section>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem" }}>
        <div>
          <div className="card">
            <h2>Featured</h2>
            <ul>
              {restFeatured.map(a => (
                <li key={a.slug}><Link className="link" href={`/wiki/${a.slug}`}>{a.title}</Link> — <span className="meta">{a.description}</span></li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>Recent</h2>
            <ul>
              {recent.map(r => (
                <li key={r.slug}><Link className="link" href={`/wiki/${r.slug}`}>{r.title}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <aside>
          <div className="card">
            <h3>Quick Links</h3>
            <ul style={{ paddingLeft: "1rem" }}>
              <li><Link className="link" href="/articles">All Articles</Link></li>
              <li><Link className="link" href="/categories">Categories</Link></li>
              <li><Link className="link" href="/search">Search</Link></li>
              <li><Link className="link" href="/about">About</Link></li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
              }
