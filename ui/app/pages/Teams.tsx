import React, { useMemo, useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";

import { Skeleton } from "@dynatrace/strato-components/content";
import { useSettingsObjectsV2 } from "@dynatrace-sdk/react-hooks";
import { TeamsTable } from "app/components/teams/TeamsTable";
import { CreateTeamModal } from "app/components/teams/CreateTeamModal";
import { EditTeamModal } from "app/components/teams/EditTeamModal";
import { DeleteTeamModal } from "app/components/teams/DeleteTeamModal";
import { PageSection } from "app/components/layout/PageSection";
import { mapAppSettingsObjectToTeam, Team } from "app/utils/teams";
import { TEAMS_SCHEMA_ID } from "app/utils/teams/constants";

export default function Teams() {
  const { data, isLoading, refetch } = useSettingsObjectsV2({
    schemaId: TEAMS_SCHEMA_ID,
    addFields: "value",
  });

  const teams = useMemo(
    () => data?.items.map(mapAppSettingsObjectToTeam),
    [data],
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTeam, setDeleteTeam] = useState<Team>();
  const [editTeam, setEditTeam] = useState<Team>();

  return isLoading || !data ? (
    <Skeleton />
  ) : (
    teams && (
      <PageSection
        title="Teams"
        description="Manage team ownership and associated services."
        right={<Button onClick={() => setCreateOpen(true)}>Add team +</Button>}
      >
        <TeamsTable teams={teams} onEdit={setEditTeam} onDelete={setDeleteTeam} />

        {createOpen && (
          <CreateTeamModal
            existingTeams={teams}
            closeDialog={() => {
              setCreateOpen(false);
            }}
            afterSave={() => refetch().then(() => setCreateOpen(false))}
          />
        )}

        {editTeam && (
          <EditTeamModal
            team={editTeam}
            existingTeams={teams}
            closeDialog={() => setEditTeam(undefined)}
            afterEdit={() => refetch().then(() => setEditTeam(undefined))}
          />
        )}
        {deleteTeam && (
          <DeleteTeamModal
            team={deleteTeam}
            closeDialog={() => setDeleteTeam(undefined)}
            afterDelete={() => refetch().then(() => setDeleteTeam(undefined))}
          />
        )}
      </PageSection>
    )
  );
}
