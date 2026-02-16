import React, { useState } from "react";

import { Modal } from "@dynatrace/strato-components-preview/overlays";
import {
  TextInput,
  FormField,
  Label,
} from "@dynatrace/strato-components-preview/forms";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";
import { Button } from "@dynatrace/strato-components/buttons";
import { useCreateSettingsV2 } from '@dynatrace-sdk/react-hooks';
import {
  addServiceUnique,
  isTeamNameTaken,
  normalize,
  Team
} from "app/utils/teams";
import { TEAMS_SCHEMA_ID } from "app/utils/teams/constants";
interface CreateTeamModalProps {
  existingTeams: Team[];
  closeDialog: () => void;
  afterSave: () => Promise<void>;
}

export function CreateTeamModal({
  existingTeams,
  closeDialog: closeDialog,
  afterSave
}: CreateTeamModalProps) {
  const [name, setName] = useState<string>("");
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { execute } = useCreateSettingsV2();
  const otherTeamNames = existingTeams.map((t) => t.name);

  const createTeam = async (name: string, services: string[]) => {
    await execute({
      body: {
        schemaId: TEAMS_SCHEMA_ID,
        value: {
          name, services
        },
      },
    });
  }
  const submit = async () => {
    const n = normalize(name);
    if (!n) return setError("Team name is required.");
    if (isTeamNameTaken(otherTeamNames, n))
      return setError("Team name must be unique.");

    await createTeam(name, services);
    await afterSave();
  };

  return (
    <Modal title="Add team" show={true} onDismiss={closeDialog}>
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
          <div style={{ opacity: 0.7 }}>No services added yet.</div>
        ) : (
          <ChipGroup>
            {services.map((service) => (
              <Chip key={service}>
                {service}
                <Chip.DeleteButton
                  onClick={() =>
                    setServices(
                      services.filter(
                        (checkedService) => checkedService !== service,
                      ),
                    )
                  }
                />
              </Chip>
            ))}
          </ChipGroup>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <TextInput
            value={newService}
            onChange={setNewService}
            placeholder="e.g. auth-service"
          />
          <Button
            onClick={() => {
              setServices((previousServices) =>
                addServiceUnique(previousServices, newService),
              );
              setNewService("");
            }}
            disabled={!normalize(newService)}
          >
            Add
          </Button>
        </div>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={() => {
              void submit().catch((e) => {
                setError("Failed to create team.");
                console.error(e);
              });
            }}
          >Create</Button>
        </div>
      </div>
    </Modal>
  );
}
