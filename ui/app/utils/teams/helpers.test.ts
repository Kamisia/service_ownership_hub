import {
  addServiceUnique,
  getConflictingServices,
  isTeamNameTaken,
  isVersionConflictError,
  key,
  mapAppSettingsObjectToTeam,
  mapTeamToUpdateSettingsParamsV2,
  normalize,
  sanitizeServices,
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

  test("sanitizeServices trims, deduplicates and removes empty values", () => {
    expect(
      sanitizeServices([" auth-service ", "", "Auth-Service", "payments-api"]),
    ).toEqual(["auth-service", "payments-api"]);
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

  test("mapAppSettingsObjectToTeam falls back to safe defaults", () => {
    const source: AppSettingsSource = {
      objectId: "team-2",
      version: "1",
      value: {},
    };

    expect(mapAppSettingsObjectToTeam(source)).toEqual({
      id: "team-2",
      name: "",
      services: [],
      version: "1",
    });
  });

  test("mapTeamToUpdateSettingsParamsV2 builds update payload correctly", () => {
    const team: TeamSource = {
      id: "team-1",
      name: " Platform Team ",
      services: ["auth-service", " auth-service "],
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

  test("getConflictingServices returns conflicting service names", () => {
    expect(
      getConflictingServices(
        [
          {
            id: "t-1",
            name: "Platform Team",
            services: ["auth-service"],
            version: "1",
          },
          {
            id: "t-2",
            name: "Payments Team",
            services: ["payments-api"],
            version: "1",
          },
        ],
        " payments-api ",
      ),
    ).toEqual(["payments-api"]);
  });

  test("isVersionConflictError detects concurrency-related failures", () => {
    expect(isVersionConflictError(new Error("412 version conflict"))).toBe(true);
    expect(isVersionConflictError(new Error("network timeout"))).toBe(false);
  });
});
