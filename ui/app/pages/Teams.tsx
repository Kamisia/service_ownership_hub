import React, { useMemo, useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";
import { DataTable } from "@dynatrace/strato-components-preview/tables";
import type { DataTableColumnDef } from "@dynatrace/strato-components-preview/tables";

type Team = { name: string; services: string[] };

export default function Teams() {
  const [teams] = useState<Team[]>([
    { name: "Platform Team", services: ["auth-service", "billing"] },
    { name: "SRE", services: ["observability"] },
  ]);

  const columns = useMemo((): DataTableColumnDef<Team, unknown>[] => {
    return [
      { id: "team", header: "Team", accessor: "name", columnType: "text" },
      { id: "services", header: "Services", accessor: "services", columnType: "text" },
    ];
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h2 style={{ marginRight: 20 }}>Teams</h2>
        <Button>Add team +</Button>
      </div>

      <div style={{ width: "90%", margin: "0 auto", minWidth: 700 }}>
        <DataTable data={teams} columns={columns} fullWidth />
      </div>
    </div>
  );
}
