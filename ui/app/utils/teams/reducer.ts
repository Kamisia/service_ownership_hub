import type { Service, Team, TeamId } from "./types";
import { now } from "./helpers";

export type TeamsEvent =
  | { type: "TEAM_ADD"; team: Team }
  | { type: "SERVICES_SET"; teamId: TeamId; services: Service[] };

export function teamsReducer(state: Team[], e: TeamsEvent): Team[] {
  switch (e.type) {
    case "TEAM_ADD":
      return [...state, e.team];

    case "SERVICES_SET":
      return state.map((t) =>
        t.id === e.teamId ? { ...t, services: e.services, updatedAt: now() } : t
      );

    default:
      return state;
  }
}
