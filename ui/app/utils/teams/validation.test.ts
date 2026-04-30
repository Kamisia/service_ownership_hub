import { validateTeamDraft } from "./validation";

describe("teams/validation", () => {
  test("returns required name error for empty team name", () => {
    expect(
      validateTeamDraft({
        name: "   ",
        services: [],
        existingTeams: [],
      }),
    ).toEqual({
      isValid: false,
      error: "teamNameRequired",
    });
  });

  test("returns unique name error for duplicate team name", () => {
    expect(
      validateTeamDraft({
        name: "platform team",
        services: [],
        existingTeams: [
          { id: "t-1", name: "Platform Team", services: [], version: "1" },
        ],
      }),
    ).toEqual({
      isValid: false,
      error: "teamNameUnique",
    });
  });

  test("returns service conflict error when service belongs to another team", () => {
    expect(
      validateTeamDraft({
        name: "Payments Team",
        services: ["auth-service"],
        existingTeams: [
          {
            id: "t-1",
            name: "Platform Team",
            services: ["auth-service"],
            version: "1",
          },
        ],
      }),
    ).toEqual({
      isValid: false,
      error: "serviceAlreadyAssigned",
    });
  });

  test("returns normalized team draft when data is valid", () => {
    expect(
      validateTeamDraft({
        name: " Payments Team ",
        services: ["payments-api", " payments-api "],
        existingTeams: [],
      }),
    ).toEqual({
      isValid: true,
      normalizedName: "Payments Team",
      normalizedServices: ["payments-api"],
    });
  });
});
