import Link from "next/link";
import React from "react";

export default function TagList({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div style={{ marginTop: 8 }}>
      {tags.map((t) => (
        <Link key={t} href={`/tags/${encodeURIComponent(t)}`} style={{ marginRight: 8 }} className="link">#{t}</Link>
      ))}
    </div>
  );
}
