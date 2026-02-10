import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";

import { DataTable } from "@dynatrace/strato-components-preview/tables";
import type { DataTableColumnDef, DataTableCustomCell } from "@dynatrace/strato-components-preview/tables";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";

type Team = { id: string; name: string; services: { id: string; name: string }[] };

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2);

export default function Teams() {
  const [teams] = useState<Team[]>([
    { id: makeId(), name: "Platform Team", services: [{ id: makeId(), name: "auth-service" }, { id: makeId(), name: "billing" }] },
    { id: makeId(), name: "SRE", services: [{ id: makeId(), name: "observability" }] },
  ]);

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
          <ChipGroup>
            {rowData.services.map((s) => (
              <Chip key={s.id}>{s.name}</Chip>
            ))}
          </ChipGroup>
        </div>

        <Button onClick={() => console.log("edit", rowData.id)}>Edit</Button>
      </div>
    ),
    []
  );

  const columns = useMemo((): DataTableColumnDef<Team, unknown>[] => {
    return [
      { id: "team", header: "Team", accessor: "name", columnType: "text", width: "2fr" },
      { id: "services", header: "Services", accessor: "services", columnType: "text", width: "5fr", cell: servicesCell },
    ];
  }, [servicesCell]);

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
