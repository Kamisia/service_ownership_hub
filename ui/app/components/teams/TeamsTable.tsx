import React, { useCallback, useMemo } from "react";

import { DataTable } from "@dynatrace/strato-components-preview/tables";
import type { DataTableColumnDef, DataTableCustomCell } from "@dynatrace/strato-components-preview/tables";

import { Button } from "@dynatrace/strato-components/buttons";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";
import type { Team } from "app/utils/teams/types";
import { useIntl } from "react-intl";
import { teamsMessages } from "./messages";

interface TeamsTableProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}


export function TeamsTable({ teams,  onEdit, onDelete }: TeamsTableProps) {
  const intl = useIntl();

  const servicesCell = useCallback<DataTableCustomCell<Team, unknown>>(
  ({ rowData }) => (
    <div style={{ display: "flex", alignItems: "center", height: "100%", minHeight: 32 }}>
      <div style={{ minWidth: 0 }}>
        {rowData.services.length === 0 ? (
          <span style={{ opacity: 0.7 }}>
            {intl.formatMessage(teamsMessages.tableNoServicesText)}
          </span>
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
  [intl]
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
      <Button onClick={() => onEdit(rowData)}>
        {intl.formatMessage(teamsMessages.editButton)}
      </Button>
      <Button onClick={() => onDelete(rowData)}>
        {intl.formatMessage(teamsMessages.deleteButton)}
      </Button>
    </div>
  ),
  [intl, onEdit, onDelete]
);


  const columns = useMemo((): DataTableColumnDef<Team, unknown>[] => {
  return [
    {
      id: "team",
      header: intl.formatMessage(teamsMessages.tableTeamHeader),
      accessor: "name",
      columnType: "text",
      width: "2fr",
    },
    {
      id: "services",
      header: intl.formatMessage(teamsMessages.tableServicesHeader),
      accessor: "services",
      columnType: "text",
      width: "5fr",
      cell: servicesCell,
      disableSorting: true,
    },
    {
      id: "actions",
      header: intl.formatMessage(teamsMessages.tableActionsHeader),
      accessor: "id",
      columnType: "text",
      width: "1.5fr",
      cell: actionsCell,
      disableSorting: true,
    },
  ];
}, [servicesCell, actionsCell, intl]);


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
