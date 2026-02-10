import React, { useEffect, useState } from "react";

import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { TextInput, FormField, Label } from "@dynatrace/strato-components-preview/forms";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";
import { Button } from "@dynatrace/strato-components/buttons";

import type { Service } from "../../utils/teams";
import { addServiceUnique, isTeamNameTaken, normalize, removeService } from "../../utils/teams";

interface CreateTeamModalProps {
  show: boolean;
  existing: string[];
  onDismiss: () => void;
  onCreate: (name: string, services: Service[]) => void;
}

export function CreateTeamModal({ show, existing, onDismiss, onCreate }: CreateTeamModalProps) {
  const [name, setName] = useState<string>("");
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!show) return;
    setName("");
    setServices([]);
    setNewService("");
    setError(null);
  }, [show]);

  const submit = () => {
    const n = normalize(name);
    if (!n) return setError("Team name is required.");
    if (isTeamNameTaken(existing, n)) return setError("Team name must be unique.");

    setError(null);
    onCreate(n, services);
  };

  return (
    <Modal title="Add team" show={show} onDismiss={onDismiss}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FormField>
          <Label>Team name</Label>
          <TextInput value={name} onChange={setName} placeholder="e.g. Platform Team" />
        </FormField>

        <div style={{ fontWeight: 600 }}>Services</div>

        {services.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No services added yet.</div>
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
          <TextInput value={newService} onChange={setNewService} placeholder="e.g. auth-service" />
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
          <Button onClick={submit}>Create</Button>
        </div>
      </div>
    </Modal>
  );
}
