import React, { useRef, useEffect, useMemo, useReducer, useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";

import type { Team, TeamId } from "../utils/teams";
import { makeId, now, teamsReducer } from "../utils/teams";

import { TeamsTable } from "../components/teams/TeamsTable";
import { CreateTeamModal } from "../components/teams/CreateTeamModal";
import { EditTeamModal } from "../components/teams/EditTeamModal";
import { DeleteTeamModal } from "../components/teams/DeleteTeamModal";

import { useUserAppStates, useSetUserAppState } from "@dynatrace-sdk/react-hooks";

const TEAMS_STATE_KEY = "teams";
const TEAMS_STATE_VERSION = "1";

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

  const userStates = useUserAppStates({
  filter: `key = '${TEAMS_STATE_KEY}'`,
  addFields: "value",
});

  const hydratedRef = useRef(false);


  useEffect(() => {
    const state = userStates.data?.[0];
    if (!state?.value) {
      hydratedRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(state.value) as { version?: string; teams?: Team[] };

      if (Array.isArray(parsed?.teams)) {
        dispatch({ type: "TEAMS_REPLACE", teams: parsed.teams });
      }
    } catch (e) {
      console.warn("Failed to parse app state for teams:", e);
    } finally {
    hydratedRef.current = true;
    }
  }, [userStates.data]);

useEffect(() => {
    if (userStates.error) {
      console.warn("Failed to load app state for teams:", userStates.error);
      hydratedRef.current = true; 
    }
  }, [userStates.error]);

  const { execute: setUserAppState } = useSetUserAppState();
  useEffect(() => {
  if (!hydratedRef.current) return;

  const handle = setTimeout(() => {
     void setUserAppState({
        key: TEAMS_STATE_KEY,
        body: {
          value: JSON.stringify({
            version: TEAMS_STATE_VERSION,
            teams,
          }),
        },
      }).catch((e) => {
        console.error("Failed to persist teams app state:", e);
      });
    }, 400);

  return () => clearTimeout(handle);
}, [teams, setUserAppState]);


  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<TeamId | null>(null);
  const [deleteId, setDeleteId] = useState<TeamId | null>(null);

  const editingTeam = useMemo(
    () => teams.find((t) => t.id === editId) ?? null,
    [teams, editId]
  );
  const deletingTeam = useMemo(
    () => teams.find((t) => t.id === deleteId) ?? null,
    [teams, deleteId]
  );

  const otherTeamNames = useMemo(
    () => teams.filter((t) => t.id !== editId).map((t) => t.name),
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
        onDelete={(id) => setDeleteId(id)}
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

            <EditTeamModal
        show={!!editingTeam}
        team={editingTeam}
        existing={otherTeamNames}
        onDismiss={() => setEditId(null)}
        onSave={(name, services) => {
            if (!editingTeam) return;

            dispatch({
              type: "TEAM_UPDATE",
              teamId: editingTeam.id,
              name,
              services,
            });

            setEditId(null);
          }}

      />
      <DeleteTeamModal
        show={!!deletingTeam}
        team={deletingTeam}
        onDismiss={() => setDeleteId(null)}
        onConfirm={() => {
           if (!deletingTeam) return;
           dispatch({
             type: "TEAM_DELETE",
             teamId: deletingTeam.id,
        });

        setDeleteId(null);
        }}
      />
   </div>
  );
}
