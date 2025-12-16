import React from "react";

export default function TOC({ headings }: { headings: string[] }) {
  if (!headings?.length) return null;
  return (
    <nav className="toc" aria-label="Table of contents">
      <strong>Contents</strong>
      <ul style={{ paddingLeft: "1rem", marginTop: 8 }}>
        {headings.map((h, i) => (
          <li key={i}>
            <a className="link" href={`#${slugify(h)}`}>{h}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}
