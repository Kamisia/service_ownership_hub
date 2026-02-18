import React, { useState } from "react";

import { Modal } from "@dynatrace/strato-components-preview/overlays";
import {
  TextInput,
  FormField,
  Label,
} from "@dynatrace/strato-components-preview/forms";
import { Chip, ChipGroup } from "@dynatrace/strato-components-preview/content";
import { Button } from "@dynatrace/strato-components/buttons";

import type { Team } from "app/utils/teams/types";
import { isTeamNameTaken, mapTeamToUpdateSettingsParamsV2, normalize } from "app/utils/teams/helpers";
import { useUpdateSettingsV2 } from "@dynatrace-sdk/react-hooks";
import { useIntl } from "react-intl";
import { teamsMessages } from "./messages";

interface EditTeamModalProps {
  team: Team;
  existingTeams: Team[];
  closeDialog: () => void;
  afterEdit: () => Promise<void>;
}

export function EditTeamModal({
  team,
  existingTeams,
  closeDialog,
  afterEdit
}: EditTeamModalProps) {
  const intl = useIntl();
  const [name, setName] = useState<string>(team.name);
  const [services, setServices] = useState<string[]>(team.services);
  const [newService, setNewService] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { execute } = useUpdateSettingsV2();

  const otherTeamNames = existingTeams?.filter((t) => t.id !== team.id).map((t) => t.name) ?? [];

  const addService = () => {
    const s = normalize(newService);
    if (!s) return;

    setServices((prev) => (prev.includes(s) ? prev : [...prev, s]));
    setNewService("");
  };

  const removeService = (serviceName: string) => {
    setServices((prev) => prev.filter((x) => x !== serviceName));
  };

  const onEdit = async () => {
    const n = normalize(name);
    if (!n) return setError(intl.formatMessage(teamsMessages.teamNameRequiredError));
    if (isTeamNameTaken(otherTeamNames, n))
      return setError(intl.formatMessage(teamsMessages.teamNameUniqueError));

    const updatedTeam = {
    ...team,
    name: n,
    services,
  };
    await execute(mapTeamToUpdateSettingsParamsV2(updatedTeam));
    await afterEdit();
  };

  return (
    <Modal
      title={intl.formatMessage(teamsMessages.editTeamTitle, { teamName: team.name })}
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
            {intl.formatMessage(teamsMessages.editNoServicesText)}
          </div>
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
            placeholder={intl.formatMessage(teamsMessages.editServicePlaceholder)}
          />
          <Button onClick={addService} disabled={!normalize(newService)}>
            {intl.formatMessage(teamsMessages.addButton)}
          </Button>
        </div>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={closeDialog}>
            {intl.formatMessage(teamsMessages.cancelButton)}
          </Button>
          <Button onClick={() => void onEdit().then()}>
            {intl.formatMessage(teamsMessages.saveButton)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
