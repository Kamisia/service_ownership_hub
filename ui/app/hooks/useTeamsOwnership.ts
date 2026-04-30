import { useMemo } from "react";
import { useSettingsObjectsV2 } from "@dynatrace-sdk/react-hooks";
import { TEAMS_SCHEMA_ID } from "app/utils/teams/constants";
import { mapAppSettingsObjectToTeam } from "app/utils/teams/helpers";

export function useTeamsOwnership() {
  const result = useSettingsObjectsV2({
    schemaId: TEAMS_SCHEMA_ID,
    addFields: "value",
  });

  const teams = useMemo(
    () => result.data?.items.map(mapAppSettingsObjectToTeam) ?? [],
    [result.data],
  );

  return {
    ...result,
    teams,
  };
}
