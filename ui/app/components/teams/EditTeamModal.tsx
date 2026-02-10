import React, { useEffect, useState } from "react";

import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { TextInput, FormField, Label } from "@dynatrace/strato-components-preview/forms";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";
import { Button } from "@dynatrace/strato-components/buttons";

import type { Service, Team } from "../../utils/teams";
import { addServiceUnique, isTeamNameTaken, normalize, removeService } from "../../utils/teams";

interface EditTeamModalProps {
  show: boolean;
  team: Team | null;

  existing: string[];

  onDismiss: () => void;
  onSave: (name: string, services: Service[]) => void;
}

export function EditTeamModal({ show, team, existing, onDismiss, onSave }: EditTeamModalProps) {
  const [name, setName] = useState<string>("");
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!show || !team) return;
    setName(team.name);
    setServices(team.services.map((s) => ({ ...s })));
    setNewService("");
    setError(null);
  }, [show, team]);

  if (!team) return null;

  const submit = () => {
    const n = normalize(name);
    if (!n) return setError("Team name is required.");
    if (isTeamNameTaken(existing, n)) return setError("Team name must be unique.");

    setError(null);
    onSave(n, services);
  };

  return (
    <Modal title={`Edit team: ${team.name}`} show={show} onDismiss={onDismiss}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FormField>
          <Label>Team name</Label>
          <TextInput value={name} onChange={setName} placeholder="e.g. Platform Team" />
        </FormField>

        <div style={{ fontWeight: 600 }}>Services</div>

        {services.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No services.</div>
        ) : (
          <ChipGroup>
            {services.map((s) => (
              <Chip key={s.id}>
                {s.name}
                <Chip.DeleteButton onClick={() => setServices((p) => removeService(p, s.id))} />
              </Chip>
            ))}
          </ChipGroup>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <TextInput value={newService} onChange={setNewService} placeholder="e.g. payments-api" />
          <Button
            onClick={() => {
              setServices((p) => addServiceUnique(p, newService));
              setNewService("");
            }}
            disabled={!normalize(newService)}
          >
            Add
          </Button>
        </div>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={onDismiss}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
