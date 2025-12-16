"use client";
import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const { data } = useSWR(q ? `/api/search?q=${encodeURIComponent(q)}` : null, url => fetch(url).then(r => r.json()));

  return (
    <div>
      <input className="search-input" placeholder="Search articles..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div style={{ marginTop: 8 }}>
        {data && data.slice(0, 10).map((r: any) => (
          <div key={r.slug}><Link className="link" href={`/wiki/${r.slug}`}>{r.title}</Link></div>
        ))}
      </div>
    </div>
  );
}
