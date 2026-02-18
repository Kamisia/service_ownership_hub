import React, { useMemo } from "react";
import type { DataTableColumnDef } from "@dynatrace/strato-components-preview/tables";
import { DataTable } from "@dynatrace/strato-components-preview/tables";
import { useIntl } from "react-intl";
import { teamsErrorsMessages } from "./messages";

export type TeamsErrorRow = {
  timestampText: string;
  serviceName: string;
  team: string;
  content: string;
};

export function TeamsErrorsTable({ rows }: { rows: TeamsErrorRow[] }) {
  const intl = useIntl();

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
    ];
  }, [intl]);

  return (
    <div style={{ width: "100%", minWidth: 900 }}>
      <DataTable data={rows} columns={columns} fullWidth sortable />
    </div>
  );
}
