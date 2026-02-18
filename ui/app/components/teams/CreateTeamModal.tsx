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
import { TEAMS_SCHEMA_ID } from "app/utils/teams/constants";
import { Team } from "app/utils/teams/types";
import { addServiceUnique, isTeamNameTaken, normalize } from "app/utils/teams/helpers";
import { useIntl } from "react-intl";
import { teamsMessages } from "./messages";
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
  const intl = useIntl();
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
    if (!n) return setError(intl.formatMessage(teamsMessages.teamNameRequiredError));
    if (isTeamNameTaken(otherTeamNames, n))
      return setError(intl.formatMessage(teamsMessages.teamNameUniqueError));

    await createTeam(name, services);
    await afterSave();
  };

  return (
    <Modal
      title={intl.formatMessage(teamsMessages.addTeamTitle)}
      show={true}
      onDismiss={closeDialog}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FormField>
          <Label>{intl.formatMessage(teamsMessages.teamNameLabel)}</Label>
          <TextInput
            value={name}
            onChange={setName}
            placeholder={intl.formatMessage(teamsMessages.teamNamePlaceholder)}
          />
        </FormField>

        <div style={{ fontWeight: 600 }}>
          {intl.formatMessage(teamsMessages.servicesSectionTitle)}
        </div>

        {services.length === 0 ? (
          <div style={{ opacity: 0.7 }}>
            {intl.formatMessage(teamsMessages.createNoServicesText)}
          </div>
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
            placeholder={intl.formatMessage(teamsMessages.createServicePlaceholder)}
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
            {intl.formatMessage(teamsMessages.addButton)}
          </Button>
        </div>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={closeDialog}>
            {intl.formatMessage(teamsMessages.cancelButton)}
          </Button>
          <Button
            onClick={() => {
              void submit().catch((e) => {
                setError(intl.formatMessage(teamsMessages.createTeamFailedError));
                console.error(e);
              });
            }}
          >
            {intl.formatMessage(teamsMessages.createButton)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
