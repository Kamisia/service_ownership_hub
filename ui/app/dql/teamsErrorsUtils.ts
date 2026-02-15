import type { Team } from "../utils/teams";
// import { useEffect, useState } from "react";
const TEAMS_LOCAL_STORAGE_KEY = "service_ownership_hub/teams";


export function formatTs(ts: string | number) {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
}

export function escapeDqlString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

export function loadTeamsFromLocalStorage(): Team[] {

  try {
    const raw = localStorage.getItem(TEAMS_LOCAL_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as { teams?: Team[] };

    return Array.isArray(parsed?.teams) ? parsed.teams : [];
  } catch (e) {
    console.warn("Failed to load teams from localStorage:", e);
    return [];
  }
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



export function useTeamsFromLocalStorage() {
//   const [version, setVersion] = useState(0);

//   useEffect(() => {
//     function onStorage(e: StorageEvent) {
//       if (e.key === "service_ownership_hub/teams") {
//         setVersion((v) => v + 1);
//       }
//     }

//     window.addEventListener("storage", onStorage);

//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

  return loadTeamsFromLocalStorage();
}
