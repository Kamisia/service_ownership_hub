import React, { useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";
import { Skeleton } from "@dynatrace/strato-components/content";
import { MessageContainer } from "@dynatrace/strato-components-preview/content";
import { CreateTeamModal } from "app/components/teams/CreateTeamModal";
import { DeleteTeamModal } from "app/components/teams/DeleteTeamModal";
import { EditTeamModal } from "app/components/teams/EditTeamModal";
import { teamsMessages } from "app/components/teams/messages";
import { useTeamsOwnership } from "app/hooks/useTeamsOwnership";
import { TeamsTable } from "app/components/teams/TeamsTable";
import { PageSection } from "app/components/layout/PageSection";
import type { Team } from "app/utils/teams/types";
import { useIntl } from "react-intl";
import { pagesMessages } from "./messages";

export default function TeamsPage() {
  const intl = useIntl();
  const { error, isError, isLoading, refetch, teams } = useTeamsOwnership();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTeam, setDeleteTeam] = useState<Team>();
  const [editTeam, setEditTeam] = useState<Team>();

  if (isLoading && teams.length === 0) {
    return <Skeleton />;
  }

  return (
    <PageSection
      title={intl.formatMessage(pagesMessages.teamsPageTitle)}
      description={intl.formatMessage(pagesMessages.teamsPageDescription)}
      right={
        !isError ? (
          <Button onClick={() => setCreateOpen(true)}>
            {intl.formatMessage(teamsMessages.addTeamButton)}
          </Button>
        ) : undefined
      }
    >
      {isError ? (
        <>
          <MessageContainer variant="critical">
            <MessageContainer.Title>Error</MessageContainer.Title>
            <MessageContainer.Description>
              {intl.formatMessage(pagesMessages.teamsPageLoadFailed, {
                error: String(error),
              })}
            </MessageContainer.Description>
          </MessageContainer>
          <Button onClick={() => void refetch()}>
            {intl.formatMessage(pagesMessages.teamsPageRetryButton)}
          </Button>
        </>
      ) : (
        <>
          <TeamsTable teams={teams} onEdit={setEditTeam} onDelete={setDeleteTeam} />

          {teams.length === 0 && (
            <MessageContainer variant="neutral">
              <MessageContainer.Title>
                {intl.formatMessage(teamsMessages.emptyTeamsTitle)}
              </MessageContainer.Title>
              <MessageContainer.Description>
                {intl.formatMessage(teamsMessages.emptyTeamsDescription)}
              </MessageContainer.Description>
            </MessageContainer>
          )}
        </>
      )}

      {createOpen && !isError && (
        <CreateTeamModal
          existingTeams={teams}
          closeDialog={() => {
            setCreateOpen(false);
          }}
          afterSave={() => refetch().then(() => setCreateOpen(false))}
        />
      )}

      {editTeam && !isError && (
        <EditTeamModal
          team={editTeam}
          existingTeams={teams}
          closeDialog={() => setEditTeam(undefined)}
          afterEdit={() => refetch().then(() => setEditTeam(undefined))}
        />
      )}

      {deleteTeam && !isError && (
        <DeleteTeamModal
          team={deleteTeam}
          closeDialog={() => setDeleteTeam(undefined)}
          afterDelete={() => refetch().then(() => setDeleteTeam(undefined))}
        />
      )}
    </PageSection>
  );
}
