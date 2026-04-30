import {
  useCreateSettingsV2,
  useDeleteSettingsV2,
  useUpdateSettingsV2,
} from "@dynatrace-sdk/react-hooks";
import { TEAMS_SCHEMA_ID } from "app/utils/teams/constants";
import { addServiceUnique, mapTeamToUpdateSettingsParamsV2 } from "app/utils/teams/helpers";
import type { Team } from "app/utils/teams/types";
import { validateTeamDraft } from "app/utils/teams/validation";

export function useTeamMutations() {
  const createMutation = useCreateSettingsV2();
  const updateMutation = useUpdateSettingsV2();
  const deleteMutation = useDeleteSettingsV2();

  const createTeam = async (params: {
    name: string;
    services: string[];
    existingTeams: Team[];
  }) => {
    const validation = validateTeamDraft({
      name: params.name,
      services: params.services,
      existingTeams: params.existingTeams,
    });

    if (!validation.isValid) {
      return validation;
    }

    await createMutation.execute({
      body: {
        schemaId: TEAMS_SCHEMA_ID,
        value: {
          name: validation.normalizedName,
          services: validation.normalizedServices,
        },
      },
    });

    return validation;
  };

  const updateTeam = async (params: {
    team: Team;
    name: string;
    services: string[];
    existingTeams: Team[];
  }) => {
    const validation = validateTeamDraft({
      name: params.name,
      services: params.services,
      existingTeams: params.existingTeams,
      currentTeamId: params.team.id,
    });

    if (!validation.isValid) {
      return validation;
    }

    await updateMutation.execute(
      mapTeamToUpdateSettingsParamsV2({
        ...params.team,
        name: validation.normalizedName,
        services: validation.normalizedServices,
      }),
    );

    return validation;
  };

  const assignServiceToExistingTeam = async (params: {
    team: Team;
    serviceName: string;
  }) => {
    await updateMutation.execute(
      mapTeamToUpdateSettingsParamsV2({
        ...params.team,
        services: addServiceUnique(params.team.services, params.serviceName),
      }),
    );
  };

  const createTeamForService = async (params: {
    name: string;
    serviceName: string;
    existingTeams: Team[];
  }) => {
    return createTeam({
      name: params.name,
      services: [params.serviceName],
      existingTeams: params.existingTeams,
    });
  };

  const deleteTeam = async (team: Team) => {
    await deleteMutation.execute({
      objectId: team.id,
      optimisticLockingVersion: team.version,
    });
  };

  return {
    createTeam,
    updateTeam,
    assignServiceToExistingTeam,
    createTeamForService,
    deleteTeam,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}
