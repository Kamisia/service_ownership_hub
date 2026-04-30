import React, { useMemo, useState } from "react";

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
import { useTeamMutations } from "app/hooks/useTeamMutations";
import { useIntl } from "react-intl";
import {
  addServiceUnique,
  isServiceAssignedToAnotherTeam,
  isVersionConflictError,
  normalize,
} from "app/utils/teams/helpers";
import type { Team } from "app/utils/teams/types";
import { teamsMessages } from "./messages";
import { useServiceSuggestions } from "app/hooks/useServiceSuggestions";

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
  const { createTeam, isCreating } = useTeamMutations();
  const {
    suggestions,
    isLoading: suggestionsLoading,
    error: suggestionsError,
  } = useServiceSuggestions();

  const filteredSuggestions = useMemo(() => {
    const query = normalize(newService).toLowerCase();

    return suggestions
      .filter(
        (suggestion) =>
          !services.some(
            (existingService) =>
              normalize(existingService).toLowerCase() === suggestion.toLowerCase(),
          ),
      )
      .filter((suggestion) => !query || suggestion.toLowerCase().includes(query))
      .slice(0, 8);
  }, [newService, services, suggestions]);

  const submit = async () => {
    const result = await createTeam({
      name,
      services,
      existingTeams,
    });

    if (!result.isValid) {
      if (result.error === "teamNameRequired") {
        setError(intl.formatMessage(teamsMessages.teamNameRequiredError));
      } else if (result.error === "teamNameUnique") {
        setError(intl.formatMessage(teamsMessages.teamNameUniqueError));
      } else {
        setError(intl.formatMessage(teamsMessages.serviceAlreadyAssignedError));
      }
      return;
    }

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
        <Text textStyle="small">
          {intl.formatMessage(teamsMessages.addServiceHint)}
        </Text>

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
                    setServices((previousServices) =>
                      previousServices.filter(
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
            disabled={!normalize(newService) || isCreating}
          >
            {intl.formatMessage(teamsMessages.addButton)}
          </Button>
        </Flex>
        {suggestionsLoading && (
          <Text textStyle="small">
            {intl.formatMessage(teamsMessages.serviceSuggestionsLoading)}
          </Text>
        )}
        {suggestionsError && (
          <Text textStyle="small">
            {intl.formatMessage(teamsMessages.serviceSuggestionsFailed)}
          </Text>
        )}
        {filteredSuggestions.length > 0 && (
          <Flex flexDirection="column" gap={4}>
            <Text textStyle="small">
              {intl.formatMessage(teamsMessages.serviceSuggestionsLabel)}
            </Text>
            <Flex gap={8} flexWrap="wrap">
              {filteredSuggestions.map((suggestion) => (
                <Button key={suggestion} onClick={() => setNewService(suggestion)}>
                  {suggestion}
                </Button>
              ))}
            </Flex>
          </Flex>
        )}

        {error && (
          <MessageContainer variant="critical">
            <MessageContainer.Title>Error</MessageContainer.Title>
            <MessageContainer.Description>{error}</MessageContainer.Description>
          </MessageContainer>
        )}

        <Flex justifyContent="flex-end" gap={8}>
          <Button onClick={closeDialog} disabled={isCreating}>
            {intl.formatMessage(teamsMessages.cancelButton)}
          </Button>
          <Button
            onClick={() => {
              void submit().catch((e) => {
                setError(
                  intl.formatMessage(
                    isVersionConflictError(e)
                      ? teamsMessages.versionConflictError
                      : teamsMessages.createTeamFailedError,
                  ),
                );
                console.error(e);
              });
            }}
            disabled={isCreating}
          >
            {intl.formatMessage(
              isCreating ? teamsMessages.creatingButton : teamsMessages.createButton,
            )}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}
