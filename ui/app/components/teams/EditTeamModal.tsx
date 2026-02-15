import React, { useState } from "react";

import { Modal } from "@dynatrace/strato-components-preview/overlays";
import {
  TextInput,
  FormField,
  Label,
} from "@dynatrace/strato-components-preview/forms";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";
import { Button } from "@dynatrace/strato-components/buttons";

import type { Team } from "../../utils/teams";
import { isTeamNameTaken, normalize, now } from "../../utils/teams";
import { useTeamUpdateMutation } from "app/hooks/teams-hooks";

interface EditTeamModalProps {
  team: Team;

  existingTeams: string[];

  closeDialog: () => void;
}

export function EditTeamModal({
  team,
  existingTeams: existing,
  closeDialog,
}: EditTeamModalProps) {
  const [name, setName] = useState<string>(team.name);
  const [services, setServices] = useState<string[]>(team.services);
  const [newService, setNewService] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateTeam } = useTeamUpdateMutation();

  const onSave = () => {
    updateTeam({
      ...team,
      name,
      services,
      updatedAt: now(),
    });
    closeDialog();
  };
  const addService = () => {
    const s = normalize(newService);
    if (!s) return;

    setServices((prev) => (prev.includes(s) ? prev : [...prev, s]));
    setNewService("");
  };

  const removeService = (serviceName: string) => {
    setServices((prev) => prev.filter((x) => x !== serviceName));
  };

  const submit = () => {
    const n = normalize(name);
    if (!n) return setError("Team name is required.");
    if (isTeamNameTaken(existing, n))
      return setError("Team name must be unique.");

    setError(null);
    onSave();
  };

  return (
    <Modal
      title={`Edit team: ${team.name}`}
      show={true}
      onDismiss={closeDialog}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FormField>
          <Label>Team name</Label>
          <TextInput
            value={name}
            onChange={setName}
            placeholder="e.g. Platform Team"
          />
        </FormField>

        <div style={{ fontWeight: 600 }}>Services</div>

        {services.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No services.</div>
        ) : (
          <ChipGroup>
            {services.map((s) => (
              <Chip key={s}>
                {s}
                <Chip.DeleteButton onClick={() => removeService(s)} />
              </Chip>
            ))}
          </ChipGroup>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <TextInput
            value={newService}
            onChange={setNewService}
            placeholder="e.g. payments-api"
          />
          <Button onClick={addService} disabled={!normalize(newService)}>
            Add
          </Button>
        </div>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
