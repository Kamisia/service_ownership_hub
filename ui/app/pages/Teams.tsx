import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";

import { DataTable } from "@dynatrace/strato-components-preview/tables";
import type { DataTableColumnDef, DataTableCustomCell } from "@dynatrace/strato-components-preview/tables";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";

type SortDirection = "asc" | "desc";

type Team = { id: string; name: string; services: { id: string; name: string }[] };

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2);

export default function Teams() {
  const [teams] = useState<Team[]>([
    { id: makeId(), name: "Platform Team", services: [{ id: makeId(), name: "auth-service" }, { id: makeId(), name: "billing" }] },
    { id: makeId(), name: "SRE", services: [{ id: makeId(), name: "observability" }] },
  ]);

  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const toggleSort = useCallback(() => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }, []);

  const sortedTeams = useMemo(() => {
    const copy = [...teams];
    copy.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [teams, sortDir]);

  const servicesCell = useCallback<DataTableCustomCell<Team, unknown>>(
    ({ rowData }) => (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
          gap: 8,
          minHeight: 32,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <ChipGroup>
            {rowData.services.map((s) => (
              <Chip key={s.id}>{s.name}</Chip>
            ))}
          </ChipGroup>
        </div>

        <Button onClick={() => console.log("edit", rowData.id)}>Edit</Button>
      </div>
    ),
    []
  );

  const TeamHeader = useCallback(() => {
    return (
      <button
        type="button"
        onClick={toggleSort}
        aria-label={`Sort by team name (${sortDir === "asc" ? "ascending" : "descending"})`}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          verticalAlign: "center",
          lineHeight: 1,
          margin: 10,
          fontWeight: 600,
          userSelect: "none",
        }}
      >
        <span style={{ lineHeight: 1 }}>Team</span>
        <span style={{ opacity: 0.65, lineHeight: 1 }}>{sortDir === "asc" ? "▲" : "▼"}</span>
      </button>
    );
  }, [toggleSort, sortDir]);

  const columns = useMemo((): DataTableColumnDef<Team, unknown>[] => {
    return [
      { id: "team", header: TeamHeader, accessor: "name", columnType: "text", width: "2fr" },
      { id: "services", header: "Services", accessor: "services", columnType: "text", width: "5fr", cell: servicesCell },
    ];
  }, [TeamHeader, servicesCell]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h2 style={{ marginRight: 20 }}>Teams</h2>
        <Button>Add team +</Button>
      </div>

      <div style={{ width: "90%", margin: "0 auto", minWidth: 700 }}>
        <DataTable data={sortedTeams} columns={columns} fullWidth />
      </div>
    </div>
  );
}
