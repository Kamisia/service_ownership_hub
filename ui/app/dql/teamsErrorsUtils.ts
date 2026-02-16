import type { Team } from "app/utils/teams/types";

export function formatTs(ts: string | number) {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
}

export function escapeDqlString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

export function parseTeamsMap(teams: Team[] | undefined): string {
  const serviceToTeam = new Map<string, string>();
  if (!teams) {
    return `record(service.name = "__no_match__", team = "")`;
  }
  for (const team of teams) {
    for (const service of team.services ?? []) {
      if (!service) continue;

      if (!serviceToTeam.has(service)) {
        serviceToTeam.set(service, team.name);
      }
    }
  }

  const entries = Array.from(serviceToTeam.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  if (entries.length === 0) {
    return `record(service.name = "__no_match__", team = "")`;
  }

  return entries
    .map(
      ([serviceName, teamName]) =>
        `record(service.name = "${escapeDqlString(serviceName)}", team = "${escapeDqlString(teamName)}")`
    )
    .join(",\n");
}