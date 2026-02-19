import React, { useState } from "react";

import { useCreateSettingsV2 } from "@dynatrace-sdk/react-hooks";
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
import { TEAMS_SCHEMA_ID } from "app/utils/teams/constants";
import {
  addServiceUnique,
  isServiceAssignedToAnotherTeam,
  isTeamNameTaken,
  normalize,
} from "app/utils/teams/helpers";
import { Team } from "app/utils/teams/types";
import { teamsMessages } from "./messages";

interface CreateTeamModalProps {
  existingTeams: Team[];
  closeDialog: () => void;
  afterSave: () => Promise<void>;
}

export function CreateTeamModal({
  existingTeams,
  closeDialog,
  afterSave,
}: CreateTeamModalProps) {
  const intl = useIntl();
  const [name, setName] = useState<string>("");
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { execute } = useCreateSettingsV2();
  const otherTeamNames = existingTeams.map((t) => t.name);

  const createTeam = async (teamName: string, teamServices: string[]) => {
    await execute({
      body: {
        schemaId: TEAMS_SCHEMA_ID,
        value: {
          name: teamName,
          services: teamServices,
        },
      },
    });
  };

  const submit = async () => {
    const normalizedName = normalize(name);
    if (!normalizedName) {
      return setError(intl.formatMessage(teamsMessages.teamNameRequiredError));
    }
    if (isTeamNameTaken(otherTeamNames, normalizedName)) {
      return setError(intl.formatMessage(teamsMessages.teamNameUniqueError));
    }
    const hasServiceConflict = services.some((service) =>
      isServiceAssignedToAnotherTeam(existingTeams, service),
    );
    if (hasServiceConflict) {
      return setError(intl.formatMessage(teamsMessages.serviceAlreadyAssignedError));
    }

    await createTeam(name, services);
    await afterSave();
  };

  return (
    <Modal
      title={intl.formatMessage(teamsMessages.addTeamTitle)}
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
            {intl.formatMessage(teamsMessages.createNoServicesText)}
          </Text>
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

        <Flex gap={8}>
          <TextInput
            value={newService}
            onChange={setNewService}
            placeholder={intl.formatMessage(teamsMessages.createServicePlaceholder)}
          />
          <Button
            onClick={() => {
              const serviceName = normalize(newService);
              if (!serviceName) return;
              if (isServiceAssignedToAnotherTeam(existingTeams, serviceName)) {
                setError(intl.formatMessage(teamsMessages.serviceAlreadyAssignedError));
                return;
              }
              setServices((previousServices) =>
                addServiceUnique(previousServices, serviceName),
              );
              setNewService("");
              setError(null);
            }}
            disabled={!normalize(newService)}
          >
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
        </Flex>
      </Flex>
    </Modal>
  );
}
