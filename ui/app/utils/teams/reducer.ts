import type { Service, Team, TeamId } from "./types";
import { now } from "./helpers";

export type TeamsEvent =
  | { type: "TEAM_ADD"; team: Team }
  | { type: "SERVICES_SET"; teamId: TeamId; services: Service[] }
  | { type: "TEAM_UPDATE"; teamId: TeamId; name: string; services: Service[] }
  | { type: "TEAM_DELETE"; teamId: TeamId };


export function teamsReducer(state: Team[], e: TeamsEvent): Team[] {
  switch (e.type) {
    case "TEAM_ADD":
      return [...state, e.team];

    case "SERVICES_SET":
      return state.map((t) =>
        t.id === e.teamId ? { ...t, services: e.services, updatedAt: now() } : t
      );
    case "TEAM_UPDATE":
      return state.map((t) =>
        t.id === e.teamId
        ? {
            ...t,
            name: e.name,
            services: e.services,
            updatedAt: now(),
            }
        : t
  );
    case "TEAM_DELETE":
        return state.filter((t) => t.id !== e.teamId);



    default:
      return state;
  }
}
