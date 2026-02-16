import React, { useCallback, useMemo } from "react";

import { DataTable } from "@dynatrace/strato-components-preview/tables";
import type { DataTableColumnDef, DataTableCustomCell } from "@dynatrace/strato-components-preview/tables";

import { Button } from "@dynatrace/strato-components/buttons";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";
import { Team } from "app/utils/teams/types";

interface TeamsTableProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}


export function TeamsTable({ teams,  onEdit, onDelete }: TeamsTableProps) {
  const servicesCell = useCallback<DataTableCustomCell<Team, undefined>>(
  ({ rowData }) => (
    <div style={{ display: "flex", alignItems: "center", height: "100%", minHeight: 32 }}>
      <div style={{ minWidth: 0 }}>
        {rowData.services.length === 0 ? (
          <span style={{ opacity: 0.7 }}>No services</span>
        ) : (
          <ChipGroup>
            {rowData.services.map((s) => (
              <Chip key={s}>{s}</Chip>
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
      <Button onClick={() => onEdit(rowData)}>Edit</Button>
      <Button onClick={() => onDelete(rowData)}>Delete</Button>
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
