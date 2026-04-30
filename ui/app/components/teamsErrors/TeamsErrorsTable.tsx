import React, { useCallback, useMemo } from "react";
import { Button } from "@dynatrace/strato-components/buttons";
import { DataTable } from "@dynatrace/strato-components-preview/tables";
import type {
  DataTableColumnDef,
  DataTableCustomCell,
} from "@dynatrace/strato-components-preview/tables";
import { useIntl } from "react-intl";
import { teamsErrorsMessages } from "./messages";

export type TeamsErrorRow = {
  timestampText: string;
  serviceName: string;
  team: string;
  content: string;
  isAssigned: boolean;
};

export function TeamsErrorsTable({
  rows,
  onAssignTeam,
}: {
  rows: TeamsErrorRow[];
  onAssignTeam: (row: TeamsErrorRow) => void;
}) {
  const intl = useIntl();

  const actionsCell = useCallback<DataTableCustomCell<TeamsErrorRow, unknown>>(
    ({ rowData }) =>
      rowData.isAssigned || !rowData.serviceName ? null : (
        <Button onClick={() => onAssignTeam(rowData)}>
          {intl.formatMessage(teamsErrorsMessages.assignTeamButton)}
        </Button>
      ),
    [intl, onAssignTeam],
  );

  const columns = useMemo((): DataTableColumnDef<TeamsErrorRow, unknown>[] => {
    return [
      {
        id: "timestamp",
        header: intl.formatMessage(teamsErrorsMessages.timestampHeader),
        accessor: "timestampText",
        columnType: "text",
        width: "content",
      },
      {
        id: "service",
        header: intl.formatMessage(teamsErrorsMessages.serviceHeader),
        accessor: "serviceName",
        columnType: "text",
        width: "content",
      },
      {
        id: "team",
        header: intl.formatMessage(teamsErrorsMessages.teamHeader),
        accessor: "team",
        columnType: "text",
        width: "content",
      },
      {
        id: "content",
        header: intl.formatMessage(teamsErrorsMessages.contentHeader),
        accessor: "content",
        columnType: "text",
        width: "1fr",
      },
      {
        id: "actions",
        header: intl.formatMessage(teamsErrorsMessages.actionsHeader),
        accessor: "serviceName",
        columnType: "text",
        width: "content",
        cell: actionsCell,
        disableSorting: true,
      },
    ];
  }, [actionsCell, intl]);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <DataTable data={rows} columns={columns} fullWidth sortable>
        <DataTable.Pagination defaultPageSize={10} pageSizeOptions={[10, 20, 50]} />
      </DataTable>
    </div>
  );
}
