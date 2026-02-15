import React, { useMemo, useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";

import { Skeleton } from "@dynatrace/strato-components/content";
import { useTeamsQuery } from "app/hooks/teams-hooks";

import { TeamsTable } from "app/components/teams/TeamsTable";
import { CreateTeamModal } from "app/components/teams/CreateTeamModal";
import { EditTeamModal } from "app/components/teams/EditTeamModal";
import { DeleteTeamModal } from "app/components/teams/DeleteTeamModal";
import { PageSection } from "app/components/layout/PageSection";
import { TeamId } from "app/utils/teams";

export default function Teams() {
  const { data: teams, isLoading } = useTeamsQuery();

  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<TeamId | null>(null);
  const [deleteId, setDeleteId] = useState<TeamId | null>(null);

  const editingTeam = useMemo(
    () => teams?.find((t) => t.id === editId) ?? null,
    [teams, editId],
  );

  const otherTeamNames = useMemo(
    () => teams?.filter((t) => t.id !== editId).map((t) => t.name) ?? [],
    [teams, editId],
  );

  return isLoading ? (
    <Skeleton />
  ) : (
    teams && (
      <PageSection
        title="Teams"
        description="Manage team ownership and associated services."
        right={<Button onClick={() => setCreateOpen(true)}>Add team +</Button>}
      >
        <TeamsTable
          teams={teams}
          onEdit={(id) => setEditId(id)}
          onDelete={(id) => setDeleteId(id)}
        />

        {createOpen && (
          <CreateTeamModal
            existingTeams={teams.map((team) => team.name)}
            closeDialog={() => setCreateOpen(false)}
          />
        )}

        {editingTeam && (
          <EditTeamModal
            team={editingTeam}
            existingTeams={otherTeamNames}
            closeDialog={() => setEditId(null)}
          />
        )}
        {deleteId && (
          <DeleteTeamModal
            deleteId={deleteId}
            closeDialog={() => setDeleteId(null)}
          />
        )}
      </PageSection>
    )
  );
}
