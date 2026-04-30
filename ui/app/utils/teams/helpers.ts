import type { AppSettingsObject } from "@dynatrace-sdk/client-app-settings-v2";
import type { UpdateSettingsParamsV2 } from "@dynatrace-sdk/react-hooks";
import type { Team } from "./types";

export const normalize = (s: string) => s.trim();
export const key = (s: string) => normalize(s).toLowerCase();

export function sanitizeServices(services: string[] | undefined): string[] {
  if (!services) {
    return [];
  }

  return services.reduce<string[]>((acc, serviceName) => {
    const normalizedServiceName = normalize(serviceName ?? "");
    if (!normalizedServiceName) {
      return acc;
    }

    if (acc.some((existingServiceName) => key(existingServiceName) === key(normalizedServiceName))) {
      return acc;
    }

    return [...acc, normalizedServiceName];
  }, []);
}

export function addServiceUnique(list: string[], name: string): string[] {
  const n = normalize(name);
  if (!n) return list;
  if (list.some((s) => key(s) === key(n))) return list;

  return [...list, n];
}

export function isTeamNameTaken(existing: string[], name: string): boolean {
  const n = key(name);
  return existing.some((x) => key(x) === n);
}

export function mapAppSettingsObjectToTeam(source: AppSettingsObject): Team {
  return {
    id: source.objectId,
    name: normalize(String(source.value?.name ?? "")),
    services: sanitizeServices(source.value?.services as string[] | undefined),
    version: source.version,
  } as Team;
}

export function mapTeamToUpdateSettingsParamsV2(
  source: Team,
): UpdateSettingsParamsV2 {
  return {
    objectId: source.id,
    optimisticLockingVersion: source.version,
    body: {
      value: {
        name: normalize(source.name),
        services: sanitizeServices(source.services),
      },
    },
  } as UpdateSettingsParamsV2;
}

export function getConflictingServices(
  teams: Team[],
  serviceName: string,
  currentTeamId?: string,
): string[] {
  const s = key(serviceName);
  return teams
    .filter((team) => team.id !== currentTeamId)
    .flatMap((team) => sanitizeServices(team.services))
    .filter((existingServiceName) => key(existingServiceName) === s);
}

export function isServiceAssignedToAnotherTeam(
  teams: Team[],
  serviceName: string,
  currentTeamId?: string,
): boolean {
  return getConflictingServices(teams, serviceName, currentTeamId).length > 0;
}

export function isVersionConflictError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return /optimistic|version|conflict|412|409/i.test(message);
}
