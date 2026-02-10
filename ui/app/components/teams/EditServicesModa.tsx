import React, { useEffect, useState } from "react";

import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { TextInput } from "@dynatrace/strato-components-preview/forms";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";
import { Button } from "@dynatrace/strato-components/buttons";

import type { Service, Team } from "../../utils/teams";
import { addServiceUnique, normalize, removeService } from "../../utils/teams";

interface EditServicesModalProps {
  show: boolean;
  team: Team | null;
  onDismiss: () => void;
  onSave: (services: Service[]) => void;
}

export function EditServicesModal({ show, team, onDismiss, onSave }: EditServicesModalProps) {
  const [draft, setDraft] = useState<Service[]>([]);
  const [newService, setNewService] = useState<string>("");

  useEffect(() => {
    if (!show || !team) return;
    setDraft(team.services.map((s) => ({ ...s })));
    setNewService("");
  }, [show, team]);

  if (!team) return null;

  return (
    <Modal title={`Edit services: ${team.name}`} show={show} onDismiss={onDismiss}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {draft.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No services.</div>
        ) : (
          <ChipGroup>
            {draft.map((s) => (
              <Chip key={s.id}>
                {s.name}
                <Chip.DeleteButton onClick={() => setDraft((p) => removeService(p, s.id))} />
              </Chip>
            ))}
          </ChipGroup>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <TextInput value={newService} onChange={setNewService} placeholder="e.g. payments-api" />
          <Button
            onClick={() => {
              setDraft((p) => addServiceUnique(p, newService));
              setNewService("");
            }}
            disabled={!normalize(newService)}
          >
            Add
          </Button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={onDismiss}>Cancel</Button>
          <Button onClick={() => onSave(draft)}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
