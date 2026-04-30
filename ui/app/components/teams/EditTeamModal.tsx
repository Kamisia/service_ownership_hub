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
import { useServiceSuggestions } from "app/hooks/useServiceSuggestions";
import { useTeamMutations } from "app/hooks/useTeamMutations";
import {
  isServiceAssignedToAnotherTeam,
  isVersionConflictError,
  normalize,
  sanitizeServices,
} from "app/utils/teams/helpers";
import type { Team } from "app/utils/teams/types";
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
  afterEdit,
}: EditTeamModalProps) {
  const intl = useIntl();
  const [name, setName] = useState<string>(team.name);
  const [services, setServices] = useState<string[]>(sanitizeServices(team.services));
  const [newService, setNewService] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { updateTeam, isUpdating } = useTeamMutations();
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

  const addService = () => {
    const serviceName = normalize(newService);
    if (!serviceName) return;

    if (isServiceAssignedToAnotherTeam(existingTeams, serviceName, team.id)) {
      setError(intl.formatMessage(teamsMessages.serviceAlreadyAssignedError));
      return;
    }

    setServices((prev) =>
      prev.some((service) => normalize(service).toLowerCase() === serviceName.toLowerCase())
        ? prev
        : [...prev, serviceName],
    );
    setNewService("");
    setError(null);
  };

  const removeService = (serviceName: string) => {
    setServices((prev) => prev.filter((service) => service !== serviceName));
  };

  const submit = async () => {
    const result = await updateTeam({
      team,
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
        <Text textStyle="small">
          {intl.formatMessage(teamsMessages.addServiceHint)}
        </Text>

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
          <Button onClick={addService} disabled={!normalize(newService) || isUpdating}>
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
          <Button onClick={closeDialog} disabled={isUpdating}>
            {intl.formatMessage(teamsMessages.cancelButton)}
          </Button>
          <Button
            onClick={() => {
              void submit().catch((e) => {
                setError(
                  intl.formatMessage(
                    isVersionConflictError(e)
                      ? teamsMessages.versionConflictError
                      : teamsMessages.updateTeamFailedError,
                  ),
                );
                console.error(e);
              });
            }}
            disabled={isUpdating}
          >
            {intl.formatMessage(
              isUpdating ? teamsMessages.savingButton : teamsMessages.saveButton,
            )}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}
