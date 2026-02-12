import React, { useMemo } from "react";
import type { DataTableColumnDef } from "@dynatrace/strato-components-preview/tables";
import { DataTable } from "@dynatrace/strato-components-preview/tables";

export type TeamsErrorRow = {
  timestampText: string;
  serviceName: string;
  team: string;
  content: string;
};



export function TeamsErrorsTable({ rows }: { rows: TeamsErrorRow[] }) {
  const columns = useMemo((): DataTableColumnDef<TeamsErrorRow, unknown>[] => {
    return [
      {
        id: "timestamp",
        header: "Timestamp",
        accessor: "timestampText",
        columnType: "text",
        width: "content",
      },
      {
        id: "service",
        header: "Service",
        accessor: "serviceName",
        columnType: "text",
        width: "content",
      },
      {
        id: "team",
        header: "Team",
        accessor: "team",
        columnType: "text",
        width: "content",
      },
      {
        id: "content",
        header: "Content",
        accessor: "content",
        columnType: "text",
        width: "1fr",
      },
    ];
  }, []);

  return (
    <div style={{ width: "100%", minWidth: 900 }}>
      <DataTable data={rows} columns={columns} fullWidth sortable />
    </div>
  );
}
