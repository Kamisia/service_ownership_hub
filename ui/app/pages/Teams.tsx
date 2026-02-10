import React, { useMemo, useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";
import { TeamsTable, Team } from "../components/teams/TeamsTable";

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2);

export default function Teams() {
  const [teams] = useState<Team[]>([
    { id: makeId(), name: "Platform Team", services: [{ id: makeId(), name: "auth-service" }, { id: makeId(), name: "billing" }] },
    { id: makeId(), name: "SRE", services: [{ id: makeId(), name: "observability" }] },
  ]);

  const [editId, setEditId] = useState<string | null>(null);
  const editingTeam = useMemo(() => teams.find((t) => t.id === editId) ?? null, [teams, editId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h2 style={{ marginRight: 20 }}>Teams</h2>
        <Button>Add team +</Button>
      </div>

      <TeamsTable teams={teams} onEditServices={(id) => setEditId(id)} />

      {editingTeam ? <div>TODO: Edit modal for {editingTeam.name}</div> : null}
    </div>
  );
}
