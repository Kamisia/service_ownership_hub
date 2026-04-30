import { addServiceUnique, isServiceAssignedToAnotherTeam, isTeamNameTaken, normalize } from "./helpers";
import type { Team } from "./types";

export type TeamValidationResult =
  | { isValid: true; normalizedName: string; normalizedServices: string[] }
  | { isValid: false; error: "teamNameRequired" | "teamNameUnique" | "serviceAlreadyAssigned" };

export function validateTeamDraft(params: {
  name: string;
  services: string[];
  existingTeams: Team[];
  currentTeamId?: string;
}): TeamValidationResult {
  const normalizedName = normalize(params.name);
  const normalizedServices = params.services.reduce<string[]>(
    (services, serviceName) => addServiceUnique(services, serviceName),
    [],
  );

  if (!normalizedName) {
    return { isValid: false, error: "teamNameRequired" };
  }

  const otherTeamNames = params.existingTeams
    .filter((team) => team.id !== params.currentTeamId)
    .map((team) => team.name);

  if (isTeamNameTaken(otherTeamNames, normalizedName)) {
    return { isValid: false, error: "teamNameUnique" };
  }

  const hasServiceConflict = normalizedServices.some((serviceName) =>
    isServiceAssignedToAnotherTeam(params.existingTeams, serviceName, params.currentTeamId),
  );

  if (hasServiceConflict) {
    return { isValid: false, error: "serviceAlreadyAssigned" };
  }

  return {
    isValid: true,
    normalizedName,
    normalizedServices,
  };
}
