import React from "react";
import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { Button } from "@dynatrace/strato-components/buttons";

import { useTeamDeleteMutation } from "../../hooks/teams-hooks";

interface Props {
  deleteId: string;
  closeDialog: () => void;
}

export function DeleteTeamModal({ deleteId, closeDialog }: Props) {
  const { mutate: deleteTeam } = useTeamDeleteMutation();
  const onDelete = () => {
    deleteTeam(deleteId);
    closeDialog();
  };
  return (
    <Modal title="Delete team" show={true} onDismiss={closeDialog}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>Are you sure you want to delete team?</div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </Modal>
  );
}
