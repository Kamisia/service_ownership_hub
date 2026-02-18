import React, { useState } from "react";

import { useUpdateSettingsV2 } from "@dynatrace-sdk/react-hooks";
import { Button } from "@dynatrace/strato-components/buttons";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Strong, Text } from "@dynatrace/strato-components/typography";
import {
  Chip,
  ChipGroup,
  MessageContainer,
} from "@dynatrace/strato-components-preview/content";
import {
  FormField,
  Label,
  TextInput,
} from "@dynatrace/strato-components-preview/forms";
import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { useIntl } from "react-intl";

import type { Team } from "app/utils/teams/types";
import {
  isTeamNameTaken,
  mapTeamToUpdateSettingsParamsV2,
  normalize,
} from "app/utils/teams/helpers";
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
  afterEdit,
}: EditTeamModalProps) {
  const intl = useIntl();
  const [name, setName] = useState<string>(team.name);
  const [services, setServices] = useState<string[]>(team.services);
  const [newService, setNewService] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { execute } = useUpdateSettingsV2();

  const otherTeamNames =
    existingTeams?.filter((t) => t.id !== team.id).map((t) => t.name) ?? [];

  const addService = () => {
    const normalizedService = normalize(newService);
    if (!normalizedService) return;

    setServices((prev) =>
      prev.includes(normalizedService) ? prev : [...prev, normalizedService],
    );
    setNewService("");
  };

  const removeService = (serviceName: string) => {
    setServices((prev) => prev.filter((x) => x !== serviceName));
  };

  const onEdit = async () => {
    const normalizedName = normalize(name);
    if (!normalizedName) {
      return setError(intl.formatMessage(teamsMessages.teamNameRequiredError));
    }
    if (isTeamNameTaken(otherTeamNames, normalizedName)) {
      return setError(intl.formatMessage(teamsMessages.teamNameUniqueError));
    }

    const updatedTeam: Team = {
      ...team,
      name: normalizedName,
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
      <Flex flexDirection="column" gap={12}>
        <FormField>
          <Label>{intl.formatMessage(teamsMessages.teamNameLabel)}</Label>
          <TextInput
            value={name}
            onChange={setName}
            placeholder={intl.formatMessage(teamsMessages.teamNamePlaceholder)}
          />
        </FormField>

        <Strong>{intl.formatMessage(teamsMessages.servicesSectionTitle)}</Strong>

        {services.length === 0 ? (
          <Text textStyle="small">
            {intl.formatMessage(teamsMessages.editNoServicesText)}
          </Text>
        ) : (
          <ChipGroup>
            {services.map((service) => (
              <Chip key={service}>
                {service}
                <Chip.DeleteButton onClick={() => removeService(service)} />
              </Chip>
            ))}
          </ChipGroup>
        )}

        <Flex gap={8}>
          <TextInput
            value={newService}
            onChange={setNewService}
            placeholder={intl.formatMessage(teamsMessages.editServicePlaceholder)}
          />
          <Button onClick={addService} disabled={!normalize(newService)}>
            {intl.formatMessage(teamsMessages.addButton)}
          </Button>
        </Flex>

        {error && (
          <MessageContainer variant="critical">
            <MessageContainer.Title>Error</MessageContainer.Title>
            <MessageContainer.Description>{error}</MessageContainer.Description>
          </MessageContainer>
        )}

        <Flex justifyContent="flex-end" gap={8}>
          <Button onClick={closeDialog}>
            {intl.formatMessage(teamsMessages.cancelButton)}
          </Button>
          <Button onClick={() => void onEdit()}>
            {intl.formatMessage(teamsMessages.saveButton)}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}
