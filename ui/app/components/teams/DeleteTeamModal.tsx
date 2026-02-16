import React from "react";
import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { Button } from "@dynatrace/strato-components/buttons";
import { useDeleteSettingsV2 } from "@dynatrace-sdk/react-hooks";
import { Team } from "app/utils/teams/types";

interface Props {
  team: Team;
  closeDialog: () => void;
  afterDelete: () => Promise<void>;
}

export function DeleteTeamModal({ team, closeDialog, afterDelete }: Props) {
  const { execute } = useDeleteSettingsV2();
  const onDelete = async () => {
    await execute({
        objectId: team.id,
        optimisticLockingVersion: team.version,
      });
    await afterDelete();
  };
  return (
    <Modal title="Delete team" show={true} onDismiss={closeDialog}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>Are you sure you want to delete "{team.name}" team?</div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={() => void onDelete()}>Delete</Button>
        </div>
      </div>
    </Modal>
  );
}
