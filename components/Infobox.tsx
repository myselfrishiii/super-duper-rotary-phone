import React from "react";

export default function Infobox({ info }: { info?: Record<string, string> }) {
  if (!info) return null;
  return (
    <aside className="infobox">
      {Object.entries(info).map(([k, v]) => (
        <div key={k}>
          <strong style={{ display: "block", fontSize: 13 }}>{k}</strong>
          <div style={{ fontSize: 14 }}>{v}</div>
        </div>
      ))}
    </aside>
  );
}
