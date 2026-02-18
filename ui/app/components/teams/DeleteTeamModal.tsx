import React from "react";

import { useDeleteSettingsV2 } from "@dynatrace-sdk/react-hooks";
import { Button } from "@dynatrace/strato-components/buttons";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Text } from "@dynatrace/strato-components/typography";
import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { useIntl } from "react-intl";
import { Team } from "app/utils/teams/types";
import { teamsMessages } from "./messages";

interface Props {
  team: Team;
  closeDialog: () => void;
  afterDelete: () => Promise<void>;
}

export function DeleteTeamModal({ team, closeDialog, afterDelete }: Props) {
  const intl = useIntl();
  const { execute } = useDeleteSettingsV2();

  const onDelete = async () => {
    await execute({
      objectId: team.id,
      optimisticLockingVersion: team.version,
    });
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

        <Flex justifyContent="flex-end" gap={8}>
          <Button onClick={closeDialog}>
            {intl.formatMessage(teamsMessages.cancelButton)}
          </Button>
          <Button onClick={() => void onDelete()}>
            {intl.formatMessage(teamsMessages.deleteButton)}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}
