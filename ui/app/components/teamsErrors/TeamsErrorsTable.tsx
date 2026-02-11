import React, { useMemo } from "react";
import type { DataTableColumnDef } from "@dynatrace/strato-components-preview/tables";
import { DataTable } from "@dynatrace/strato-components-preview/tables";

export type TeamsErrorRow = {
  timestamp: string | number;
  serviceName: string;
  team: string;
  content: string;
};

function formatTs(ts: string | number) {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
}

export function TeamsErrorsTable({ rows }: { rows: TeamsErrorRow[] }) {
  const columns = useMemo((): DataTableColumnDef<TeamsErrorRow, unknown>[] => {
    return [
      {
        id: "timestamp",
        header: "Timestamp",
        accessor: "timestamp",
        columnType: "text",
        width: "content",
        cell: ({ rowData }) => <span>{formatTs(rowData.timestamp)}</span>,
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
