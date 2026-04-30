import React from "react";

import { Button } from "@dynatrace/strato-components/buttons";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Text } from "@dynatrace/strato-components/typography";
import { MessageContainer } from "@dynatrace/strato-components-preview/content";
import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { useTeamMutations } from "app/hooks/useTeamMutations";
import { useIntl } from "react-intl";
import { isVersionConflictError } from "app/utils/teams/helpers";
import type { Team } from "app/utils/teams/types";
import { teamsMessages } from "./messages";

interface Props {
  team: Team;
  closeDialog: () => void;
  afterDelete: () => Promise<void>;
}

export function DeleteTeamModal({ team, closeDialog, afterDelete }: Props) {
  const intl = useIntl();
  const { deleteTeam, isDeleting } = useTeamMutations();
  const [error, setError] = React.useState<string | null>(null);

  const onDelete = async () => {
    await deleteTeam(team);
    await afterDelete();
  };

  return (
    <Modal
      title={intl.formatMessage(teamsMessages.deleteTeamTitle)}
      show={true}
      onDismiss={closeDialog}
    >
      <Flex flexDirection="column" gap={16}>
        <Text>
          {intl.formatMessage(teamsMessages.deleteTeamConfirmation, {
            teamName: team.name,
          })}
        </Text>
        {error && (
          <MessageContainer variant="critical">
            <MessageContainer.Title>Error</MessageContainer.Title>
            <MessageContainer.Description>{error}</MessageContainer.Description>
          </MessageContainer>
        )}

        <Flex justifyContent="flex-end" gap={8}>
          <Button onClick={closeDialog} disabled={isDeleting}>
            {intl.formatMessage(teamsMessages.cancelButton)}
          </Button>
          <Button
            onClick={() => {
              void onDelete().catch((e) => {
                setError(
                  intl.formatMessage(
                    isVersionConflictError(e)
                      ? teamsMessages.versionConflictError
                      : teamsMessages.deleteTeamFailedError,
                  ),
                );
                console.error(e);
              });
            }}
            disabled={isDeleting}
          >
            {intl.formatMessage(
              isDeleting ? teamsMessages.deletingButton : teamsMessages.deleteButton,
            )}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}
