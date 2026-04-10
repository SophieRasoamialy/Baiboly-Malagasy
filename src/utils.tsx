import React from "react";

export const formatTitle = (title: string): string => {
  // Split into [...] blocks, keep only real section titles (not footnotes)
  const parts = title
    .split(/\]\s*\[/)
    .map((p) => p.replace(/^\[|\]$/g, "").trim())
    .filter(
      (p) =>
        p &&
        !p.startsWith("*") &&
        !p.startsWith("(") &&
        !p.toLowerCase().startsWith("na:") &&
        !p.toLowerCase().startsWith("heb.") &&
        !p.toLowerCase().startsWith("grika:") &&
        p !== "",
    )
    .map((p) => p.replace(/[[\]*]/g, "").trim())
    .filter((p) => p.length > 0);
  return parts.join(" — ");
};

export const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query || query.length < 3) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="highlight-text">
        {part}
      </span>
    ) : (
      part
    ),
  );
};
