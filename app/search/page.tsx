"use client";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Fetch error");
  return res.json();
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const { data, error } = useSWR(q ? `/api/search?q=${encodeURIComponent(q)}` : null, fetcher);

  return (
    <div>
      <h1>Search</h1>
      <p className="meta">Search titles and content</p>
      <input className="search-input" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div style={{ marginTop: ".75rem" }}>
        {!q && <p className="meta">Type a query to search.</p>}
        {error && <p className="meta">Error searching</p>}
        {data && (
          <ul>
            {data.map((r: any) => (
              <li key={r.slug}><Link className="link" href={`/wiki/${r.slug}`}>{r.title}</Link> <span className="meta">— {r.description}</span></li>
            ))}
            {data.length === 0 && <li className="meta">No results</li>}
          </ul>
        )}
      </div>
    </div>
  );
}
