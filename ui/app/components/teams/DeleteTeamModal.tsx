import React from "react";
import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { Button } from "@dynatrace/strato-components/buttons";

import type { Team } from "../../utils/teams";

interface Props {
  show: boolean;
  team: Team | null;
  onDismiss: () => void;
  onConfirm: () => void;
}

export function DeleteTeamModal({ show, team, onDismiss, onConfirm }: Props) {
  if (!team) return null;

  return (
    <Modal title="Delete team" show={show} onDismiss={onDismiss}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          Are you sure you want to delete team <b>{team.name}</b>?
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={onDismiss}>Cancel</Button>
          <Button onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </Modal>
  );
}
