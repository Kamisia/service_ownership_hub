import React, { useMemo, useReducer, useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";

import type { Team, TeamId } from "../utils/teams";
import { makeId, now, teamsReducer } from "../utils/teams";

import { TeamsTable } from "../components/teams/TeamsTable";
import { CreateTeamModal } from "../components/teams/CreateTeamModal";
import { EditServicesModal } from "../components/teams/EditServicesModal";

export default function Teams() {
 const initialTeams: Team[] = [
  {
    id: makeId(),
    name: "Platform Team",
    services: [
      { id: makeId(), name: "auth-service", createdAt: now(), updatedAt: now() },
      { id: makeId(), name: "billing-api", createdAt: now(), updatedAt: now() },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: makeId(),
    name: "SRE",
    services: [
      { id: makeId(), name: "observability", createdAt: now(), updatedAt: now() },
      { id: makeId(), name: "incident-bot", createdAt: now(), updatedAt: now() },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: makeId(),
    name: "Frontend",
    services: [
      { id: makeId(), name: "ui-shell", createdAt: now(), updatedAt: now() },
      { id: makeId(), name: "design-system", createdAt: now(), updatedAt: now() },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
];

const [teams, dispatch] = useReducer(teamsReducer, initialTeams);

  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<TeamId | null>(null);

  const editingTeam = useMemo(
    () => teams.find((t) => t.id === editId) ?? null,
    [teams, editId]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h2 style={{ marginRight: 20 }}>List of Teams</h2>
        <Button onClick={() => setCreateOpen(true)}>Add team +</Button>
      </div>

      <TeamsTable
        teams={teams}
        onEdit={(id) => setEditId(id)}
        onDelete={(id) => {
          // commit 2/3: podepniemy modal + reducer
          console.log("delete team", id);
        }}
      />

      <CreateTeamModal
        show={createOpen}
        existing={teams.map((t) => t.name)}
        onDismiss={() => setCreateOpen(false)}
        onCreate={(name, services) => {
          const team: Team = {
            id: makeId(),
            name,
            services,
            createdAt: now(),
            updatedAt: now(),
          };
          dispatch({ type: "TEAM_ADD", team });
          setCreateOpen(false);
        }}
      />

      <EditServicesModal
        show={!!editingTeam}
        team={editingTeam}
        onDismiss={() => setEditId(null)}
        onSave={(services) => {
          if (!editingTeam) return;
          dispatch({ type: "SERVICES_SET", teamId: editingTeam.id, services });
          setEditId(null);
        }}
      />
    </div>
  );
}
