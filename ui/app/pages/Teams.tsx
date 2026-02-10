import React, { useMemo, useReducer, useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";

import type { Team, TeamId } from "../utils/teams";
import { makeId, now, teamsReducer } from "../utils/teams";

import { TeamsTable } from "../components/teams/TeamsTable";
import { CreateTeamModal } from "../components/teams/CreateTeamModal";
import { EditServicesModal } from "../components/teams/EditServicesModa";

export default function Teams() {
  const [teams, dispatch] = useReducer(teamsReducer, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<TeamId | null>(null);

  const editingTeam = useMemo(
    () => teams.find((t) => t.id === editId) ?? null,
    [teams, editId]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h2 style={{ marginRight: 20 }}>Teams</h2>
        <Button onClick={() => setCreateOpen(true)}>Add team +</Button>
      </div>

      <TeamsTable teams={teams} onEditServices={(id) => setEditId(id)} />

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
