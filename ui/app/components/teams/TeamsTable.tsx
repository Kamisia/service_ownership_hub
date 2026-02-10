import React, { useCallback, useMemo } from "react";

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

export function TeamsTable({ teams, onEditServices }: TeamsTableProps) {
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

  const columns = useMemo((): DataTableColumnDef<Team, unknown>[] => {
    return [
      { id: "team", header: "Team", accessor: "name", columnType: "text", width: "2fr" },

      {
        id: "services",
        header: "Services",
        accessor: "services",
        columnType: "text",
        width: "5fr",
        cell: servicesCell,
        disableSorting: true,
      },
    ];
  }, [servicesCell]);

  return (
    <div style={{ width: "90%", margin: "0 auto", minWidth: 700 }}>
      <DataTable
        data={teams}
        columns={columns}
        fullWidth
        sortable
      />
    </div>
  );
}
