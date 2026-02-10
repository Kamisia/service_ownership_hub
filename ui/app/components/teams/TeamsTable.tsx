import React, { useCallback, useMemo, useState } from "react";

import { DataTable } from "@dynatrace/strato-components-preview/tables";
import type { DataTableColumnDef, DataTableCustomCell } from "@dynatrace/strato-components-preview/tables";

import { Button } from "@dynatrace/strato-components/buttons";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";

type TeamId = string;

export interface Team {
  id: TeamId;
  name: string;
  services: { id: string; name: string }[];
}

interface TeamsTableProps {
  teams: Team[];
  onEditServices: (teamId: TeamId) => void;
}

type SortDirection = "asc" | "desc";

export function TeamsTable({ teams, onEditServices }: TeamsTableProps) {
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
          {rowData.services.length === 0 ? (
            <span style={{ opacity: 0.7 }}>No services</span>
          ) : (
            <ChipGroup>
              {rowData.services.map((s) => (
                <Chip key={s.id}>{s.name}</Chip>
              ))}
            </ChipGroup>
          )}
        </div>

        <Button onClick={() => onEditServices(rowData.id)}>Edit</Button>
      </div>
    ),
    [onEditServices]
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
    <div style={{ width: "90%", margin: "0 auto", minWidth: 700 }}>
      <DataTable data={sortedTeams} columns={columns} fullWidth />
    </div>
  );
}
