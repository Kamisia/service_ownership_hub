import type { Team } from "app/utils/teams";
import {
  useMutation,
  useQuery,
  UseQueryResult,
  useQueryClient,
} from "react-query";

export const TEAMS_DATA_KEY = "service_ownership_hub/teams";
export const TEN_MINUTES_IN_MILLISECONDS = 600_000;

const loadTeams = (): Promise<Team[]> => {
  try {
    return Promise.resolve(loadTeamsFromLocalStorage());
  } catch {
    console.error(
      `Cannot parse data in ${TEAMS_DATA_KEY} local storage item to Team array. Returning empty team list`,
    );
    return Promise.resolve([]);
  }
};

const loadTeamsFromLocalStorage = (): Team[] => {
  const raw = localStorage.getItem(TEAMS_DATA_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw) as { teams: Team[] };
  console.log("parsed JSON:", parsed);
  return parsed.teams;
};

const saveTeamsToLocalStorage = (teams: Team[]) => {
  const payload: { teams: Team[] } = { teams };
  localStorage.setItem(TEAMS_DATA_KEY, JSON.stringify(payload));
};
export const useTeamsQuery = (): UseQueryResult<Team[], Error> => {
  return useQuery<Team[], Error>([TEAMS_DATA_KEY], loadTeams, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: TEN_MINUTES_IN_MILLISECONDS,
  });
};

const createTeam = (team: Team): Promise<Team> => {
  const teams = loadTeamsFromLocalStorage();
  if (teams.some((t) => t.id === team.id)) {
    return Promise.reject(new Error(`Team with id=${team.id} already exists`));
  }
  const update = [...teams, team];
  saveTeamsToLocalStorage(update);
  return Promise.resolve(team);
};
const updateTeam = (team: Team): Promise<Team> => {
  const teams = loadTeamsFromLocalStorage();
  const idx = teams.findIndex((t) => t.id === team.id);
  if (idx === -1) {
    return Promise.reject(new Error(`Team with id=${team.id} not found`));
  }
  const updated = [...teams];
  updated[idx] = team;
  saveTeamsToLocalStorage(updated);
  return Promise.resolve(team);
};
const deleteTeam = (teamId: string): Promise<string> => {
  const teams = loadTeamsFromLocalStorage();
  const updated = teams.filter((team) => team.id !== teamId);
  saveTeamsToLocalStorage(updated);
  return Promise.resolve(teamId);
};

export const useTeamCreationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Team, Error, Team>(createTeam, {
    onSuccess: (createdTeam) => {
      queryClient.setQueryData<Team[]>(
        [TEAMS_DATA_KEY],
        (prev = []) => [...prev, createdTeam] as Team[],
      );
    },
  });
};
export const useTeamUpdateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Team, Error, Team>(updateTeam, {
    onSuccess: (updatedTeam) => {
      queryClient.setQueryData<Team[]>([TEAMS_DATA_KEY], (prev = []) =>
        prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)),
      );
    },
  });
};
export const useTeamDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteTeam, {
    onSuccess: (deleteTeamId) => {
      queryClient.setQueryData<Team[]>([TEAMS_DATA_KEY], (prev = []) =>
        prev.filter((team) => team.id !== deleteTeamId),
      );
    },
  });
};
