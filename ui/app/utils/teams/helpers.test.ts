import {
  addServiceUnique,
  isTeamNameTaken,
  key,
  mapAppSettingsObjectToTeam,
  mapTeamToUpdateSettingsParamsV2,
  normalize,
} from "./helpers";

type AppSettingsSource = Parameters<typeof mapAppSettingsObjectToTeam>[0];
type TeamSource = Parameters<typeof mapTeamToUpdateSettingsParamsV2>[0];

describe("teams/helpers", () => {
  test("normalize trims whitespace and returns empty string for spaces-only input", () => {
    expect(normalize("  Platform Team  ")).toBe("Platform Team");
    expect(normalize("   ")).toBe("");
  });

  test("key normalizes and lowercases input", () => {
    expect(key("  Team A  ")).toBe("team a");
  });

  test("addServiceUnique adds a new non-empty service", () => {
    expect(addServiceUnique(["auth-service"], "payments-api")).toEqual([
      "auth-service",
      "payments-api",
    ]);
  });

  test("addServiceUnique does not add duplicate service (case-insensitive)", () => {
    expect(addServiceUnique(["Auth-Service"], " auth-service ")).toEqual([
      "Auth-Service",
    ]);
  });

  test("addServiceUnique ignores empty service names", () => {
    expect(addServiceUnique(["auth-service"], "   ")).toEqual(["auth-service"]);
  });

  test("isTeamNameTaken detects existing name case-insensitively", () => {
    expect(isTeamNameTaken(["Platform Team"], " platform team ")).toBe(true);
    expect(isTeamNameTaken(["Platform Team"], "SRE Team")).toBe(false);
  });

  test("mapAppSettingsObjectToTeam maps objectId/value/version correctly", () => {
    const source: AppSettingsSource = {
      objectId: "team-1",
      version: "7",
      value: {
        name: "Platform Team",
        services: ["auth-service", "payments-api"],
      },
    };

    expect(mapAppSettingsObjectToTeam(source)).toEqual({
      id: "team-1",
      name: "Platform Team",
      services: ["auth-service", "payments-api"],
      version: "7",
    });
  });

  test("mapTeamToUpdateSettingsParamsV2 builds update payload correctly", () => {
    const team: TeamSource = {
      id: "team-1",
      name: "Platform Team",
      services: ["auth-service"],
      version: "3",
    };

    expect(mapTeamToUpdateSettingsParamsV2(team)).toEqual({
      objectId: "team-1",
      optimisticLockingVersion: "3",
      body: {
        value: {
          name: "Platform Team",
          services: ["auth-service"],
        },
      },
    });
  });
});
