import React, { useMemo, useState } from "react";
import { useDql } from "@dynatrace-sdk/react-hooks";
import { Button } from "@dynatrace/strato-components/buttons";

import { teamsErrorsQuery } from "../dql/teamsErrorsQuery";
import { TeamsErrorsTable, type TeamsErrorRow } from "../components/teamsErrors/TeamsErrorsTable";
import { PageSection } from "../components/layout/PageSection";

type RawDqlRecord = {
  timestamp: string | number;
  content?: string;
  team?: string;
  "service.name"?: string;
};

function formatTs(ts: string | number) {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
}

export default function TeamsError() {
  const result = useDql({ query: teamsErrorsQuery });

  const rowsAll = useMemo((): TeamsErrorRow[] => {
    const records = (result.data?.records ?? []) as RawDqlRecord[];
    return records.map((r) => ({
      timestampText: formatTs(r.timestamp),
      content: r.content ?? "",
      team: r.team ?? "",
      serviceName: r["service.name"] ?? "",
    }));
  }, [result.data]);


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
    <PageSection
    title="Teams errors"
    description="Latest ERROR logs with service name and team mapping."
    right={
      <>
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
          </Button>      </>
    }
  >
   

      {result.isLoading && (
        <>
        <div style={{ fontWeight: 600 }}>Loading…</div>
        <div style={{ marginTop: 6, opacity: 0.75 }}>Querying logs via DQL.</div>
        </>
      )}

      {result.error && (
        <>
          <div style={{ fontWeight: 600, color: "crimson" }}>Couldn’t load data</div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            {String(result.error)}
          </div>
        </>
      )}

      {!result.isLoading && !result.error && rows.length === 0 && (
        <>
          <div style={{ fontWeight: 600 }}>No results</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            Either there are no ERROR logs matching the filters or <code>service.name</code> is missing.
          </div>
        </>
      )}

      {!result.isLoading && !result.error && rows.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div style={{ fontWeight: 600 }}>Results</div>
            <div style={{ opacity: 0.75 }}>{rows.length} rows</div>
          </div>
         
            <TeamsErrorsTable rows={rows} />
          
        </>
      )}
    </PageSection>
  );
}
