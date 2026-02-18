import React from "react";
import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { Button } from "@dynatrace/strato-components/buttons";
import { useDeleteSettingsV2 } from "@dynatrace-sdk/react-hooks";
import { Team } from "app/utils/teams/types";
import { useIntl } from "react-intl";
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
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          {intl.formatMessage(teamsMessages.deleteTeamConfirmation, {
            teamName: team.name,
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={closeDialog}>
            {intl.formatMessage(teamsMessages.cancelButton)}
          </Button>
          <Button onClick={() => void onDelete()}>
            {intl.formatMessage(teamsMessages.deleteButton)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
