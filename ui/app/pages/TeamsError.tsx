import React, { useMemo, useState } from "react";
import { useDql } from "@dynatrace-sdk/react-hooks";
import { Button } from "@dynatrace/strato-components/buttons";

import { teamsErrorsQuery } from "../dql/teamsErrorsQuery";
import { TeamsErrorsTable, type TeamsErrorRow } from "../components/teamsErrors/TeamsErrorsTable";

type RawDqlRecord = {
  timestamp: string | number;
  content?: string;
  team?: string;
  "service.name"?: string;
};

function Panel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: 16,
        background: "rgba(255,255,255,0.6)",
      }}
    >
      {children}
    </div>
  );
}

export default function TeamsError() {
  const result = useDql({ query: teamsErrorsQuery });

  const rowsAll = useMemo((): TeamsErrorRow[] => {
    const records = (result.data?.records ?? []) as RawDqlRecord[];
    return records.map((r) => ({
      timestamp: r.timestamp,
      content: r.content ?? "",
      team: r.team ?? "",
      serviceName: r["service.name"] ?? "",
    }));
  }, [result.data]);

  // prosta “ładna” funkcja: filtr po service/team
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rowsAll;

    return rowsAll.filter((r) => {
      return (
        r.serviceName.toLowerCase().includes(query) ||
        r.team.toLowerCase().includes(query) ||
        r.content.toLowerCase().includes(query)
      );
    });
  }, [rowsAll, q]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1200 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Teams errors</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
            Latest ERROR logs with service name and team mapping.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by service, team, content…"
            style={{
              width: 320,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)",
              outline: "none",
            }}
          />
          <Button
             onClick={() => {
               void result.refetch?.().catch((e) => console.error("Refetch failed:", e));
             }}
             disabled={result.isLoading}
          >
                Refresh
          </Button>
        </div>
      </div>

      {result.isLoading && (
        <Panel>
          <div style={{ fontWeight: 600 }}>Loading…</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>Querying logs via DQL.</div>
        </Panel>
      )}

      {result.error && (
        <Panel>
          <div style={{ fontWeight: 600, color: "crimson" }}>Couldn’t load data</div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            {String(result.error)}
          </div>
        </Panel>
      )}

      {!result.isLoading && !result.error && rows.length === 0 && (
        <Panel>
          <div style={{ fontWeight: 600 }}>No results</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            Either there are no ERROR logs matching the filters or <code>service.name</code> is missing.
          </div>
        </Panel>
      )}

      {!result.isLoading && !result.error && rows.length > 0 && (
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div style={{ fontWeight: 600 }}>Results</div>
            <div style={{ opacity: 0.75 }}>{rows.length} rows</div>
          </div>
          <TeamsErrorsTable rows={rows} />
        </Panel>
      )}
    </div>
  );
}
