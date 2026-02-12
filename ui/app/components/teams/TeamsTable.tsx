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
  onEdit: (teamId: TeamId) => void;
  onDelete: (teamId: TeamId) => void;
}


export function TeamsTable({ teams,  onEdit, onDelete }: TeamsTableProps) {
  const servicesCell = useCallback<DataTableCustomCell<Team, unknown>>(
  ({ rowData }) => (
    <div style={{ display: "flex", alignItems: "center", height: "100%", minHeight: 32 }}>
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
    </div>
  ),
  []
);

const actionsCell = useCallback<DataTableCustomCell<Team, unknown>>(
  ({ rowData }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 8,
        height: "100%",
        minHeight: 32,
      }}
    >
      <Button onClick={() => onEdit(rowData.id)}>Edit</Button>
      <Button onClick={() => onDelete(rowData.id)}>Delete</Button>
    </div>
  ),
  [onEdit, onDelete]
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
    {
      id: "actions",
      header: "Actions",
      accessor: "id",
      columnType: "text",
      width: "1.5fr",
      cell: actionsCell,
      disableSorting: true,
    },
  ];
}, [servicesCell, actionsCell]);


  return (
    <div style={{ width: "100%", margin: "0 auto", minWidth: 900 }}>
      <DataTable
        data={teams}
        columns={columns}
        fullWidth
        sortable
      />
    </div>
  );
}
