import React, { useMemo, useState } from "react";
import { Button } from "@dynatrace/strato-components/buttons";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Text } from "@dynatrace/strato-components/typography";
import { MessageContainer } from "@dynatrace/strato-components-preview/content";
import { TextInput } from "@dynatrace/strato-components-preview/forms";
import { Modal } from "@dynatrace/strato-components-preview/overlays";
import { useTeamMutations } from "app/hooks/useTeamMutations";
import {
  isVersionConflictError,
  normalize,
} from "app/utils/teams/helpers";
import type { Team } from "app/utils/teams/types";
import { useIntl } from "react-intl";
import { teamsMessages } from "../teams/messages";
import { teamsErrorsMessages } from "./messages";

type AssignTeamModalProps = {
  teams: Team[];
  serviceName: string;
  closeDialog: () => void;
  afterAssign: () => Promise<void>;
};

type Mode = "existing" | "new";

export function AssignTeamModal({
  teams,
  serviceName,
  closeDialog,
  afterAssign,
}: AssignTeamModalProps) {
  const intl = useIntl();
  const initialMode: Mode = teams.length > 0 ? "existing" : "new";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(teams[0]?.id);
  const [newTeamName, setNewTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const {
    assignServiceToExistingTeam,
    createTeamForService,
    isCreating,
    isUpdating,
  } = useTeamMutations();
  const isLoading = isUpdating || isCreating;

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [selectedTeamId, teams],
  );

  const assignToExistingTeam = async () => {
    if (!selectedTeam) {
      return;
    }

    await assignServiceToExistingTeam({
      team: selectedTeam,
      serviceName,
    });
    await afterAssign();
  };

  const createNewTeam = async () => {
    const result = await createTeamForService({
      name: newTeamName,
      serviceName,
      existingTeams: teams,
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

    await afterAssign();
  };

  const submit = () => {
    setError(null);

    const action = mode === "existing" ? assignToExistingTeam : createNewTeam;
    void action().catch((e) => {
      setError(
        intl.formatMessage(
          isVersionConflictError(e)
            ? teamsErrorsMessages.versionConflictError
            : teamsErrorsMessages.assignFailedError,
        ),
      );
      console.error(e);
    });
  };

  return (
    <Modal
      title={intl.formatMessage(teamsErrorsMessages.assignTeamModalTitle)}
      show={true}
      onDismiss={closeDialog}
    >
      <Flex flexDirection="column" gap={12}>
        <Text>
          {intl.formatMessage(teamsErrorsMessages.assignTeamModalDescription, {
            serviceName,
          })}
        </Text>

        <Flex gap={8} flexWrap="wrap">
          {teams.length > 0 && (
            <Button
              onClick={() => {
                setMode("existing");
                setError(null);
              }}
              disabled={isLoading}
              style={{
                border: mode === "existing" ? "2px solid currentColor" : undefined,
              }}
            >
              {intl.formatMessage(teamsErrorsMessages.assignExistingMode)}
            </Button>
          )}
          <Button
            onClick={() => {
              setMode("new");
              setError(null);
            }}
            disabled={isLoading}
            style={{
              border: mode === "new" ? "2px solid currentColor" : undefined,
            }}
          >
            {intl.formatMessage(teamsErrorsMessages.createNewMode)}
          </Button>
        </Flex>

        {mode === "existing" ? (
          teams.length === 0 ? (
            <MessageContainer variant="neutral">
              <MessageContainer.Title>
                {intl.formatMessage(teamsErrorsMessages.noTeamsTitle)}
              </MessageContainer.Title>
              <MessageContainer.Description>
                {intl.formatMessage(teamsErrorsMessages.noTeamsDescription)}
              </MessageContainer.Description>
            </MessageContainer>
          ) : (
            <>
              <Text textStyle="small">
                {intl.formatMessage(teamsErrorsMessages.chooseTeamLabel)}
              </Text>
              <Flex gap={8} flexWrap="wrap">
                {teams.map((team) => {
                  const isSelected = team.id === selectedTeamId;
                  return (
                    <Button
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      disabled={isLoading}
                      style={{
                        border: isSelected ? "2px solid currentColor" : undefined,
                      }}
                    >
                      {team.name}
                    </Button>
                  );
                })}
              </Flex>
            </>
          )
        ) : (
          <>
            <Text textStyle="small">
              {intl.formatMessage(teamsErrorsMessages.newTeamLabel)}
            </Text>
            <TextInput
              value={newTeamName}
              onChange={setNewTeamName}
              placeholder={intl.formatMessage(teamsMessages.teamNamePlaceholder)}
              disabled={isLoading}
            />
            <Text textStyle="small">
              {intl.formatMessage(teamsErrorsMessages.newTeamHint)}
            </Text>
          </>
        )}

        {error && (
          <MessageContainer variant="critical">
            <MessageContainer.Title>Error</MessageContainer.Title>
            <MessageContainer.Description>{error}</MessageContainer.Description>
          </MessageContainer>
        )}

        <Flex justifyContent="flex-end" gap={8}>
          <Button onClick={closeDialog} disabled={isLoading}>
            {intl.formatMessage(teamsMessages.cancelButton)}
          </Button>
          <Button
            onClick={submit}
            disabled={
              isLoading ||
              (mode === "existing" && (!selectedTeam || teams.length === 0)) ||
              (mode === "new" && !normalize(newTeamName))
            }
          >
            {intl.formatMessage(
              isLoading
                ? teamsErrorsMessages.assigningButton
                : mode === "existing"
                  ? teamsErrorsMessages.assignConfirmButton
                  : teamsMessages.createButton,
            )}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}
