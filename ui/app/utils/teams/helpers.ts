import { AppSettingsObject } from "@dynatrace-sdk/client-app-settings-v2";
import { Team } from "./types";
import { UpdateSettingsParamsV2 } from "@dynatrace-sdk/react-hooks";

export const normalize = (s: string) => s.trim();
export const key = (s: string) => normalize(s).toLowerCase();

export function addServiceUnique(list: string[], name: string): string[] {
  const n = normalize(name);
  if (!n) return list;
  if (list.some((s) => key(s) === key(n))) return list;

  return [...list, name];
}

export function isTeamNameTaken(existing: string[], name: string): boolean {
  const n = key(name);
  return existing.some((x) => key(x) === n);
}

export function mapAppSettingsObjectToTeam(source: AppSettingsObject): Team {
  return {
    id: source.objectId,
    name: source.value?.name as string,
    services: source.value?.services as string[],
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
        name: source.name,
        services: source.services,
      },
    },
  } as UpdateSettingsParamsV2;
}
 export function isServiceAssignedToAnotherTeam(
  teams :Team[],
  serviceName: string,
  currentTeamId?: string,
): boolean {
  const s = key(serviceName);
  return teams.some(
    (t) => t.id !== currentTeamId && (t.services ?? []).some((x) => key(x) === s),
  );
}
