import React from "react";



export function PageSection({
  title,
  description,
  right,
  children,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1200 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          {description ? (
            <p style={{ margin: "6px 0 0", opacity: 0.75 }}>{description}</p>
          ) : null}
        </div>

        {right ? <div style={{ display: "flex", gap: 8 }}>{right}</div> : null}
      </div>

      {children}
    </div>
  );
}
