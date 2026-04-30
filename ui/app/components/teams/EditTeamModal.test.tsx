import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useServiceSuggestions } from "app/hooks/useServiceSuggestions";
import { useTeamMutations } from "app/hooks/useTeamMutations";
import { EditTeamModal } from "./EditTeamModal";

jest.mock("app/hooks/useServiceSuggestions", () => ({
  useServiceSuggestions: jest.fn(),
}));

jest.mock("app/hooks/useTeamMutations", () => ({
  useTeamMutations: jest.fn(),
}));

describe("components/teams/EditTeamModal", () => {
  const useServiceSuggestionsMock = useServiceSuggestions as jest.Mock;
  const useTeamMutationsMock = useTeamMutations as jest.Mock;

  const baseTeam = {
    id: "t-1",
    name: "Platform Team",
    services: ["auth-service"],
    version: "4",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useServiceSuggestionsMock.mockReturnValue({
      suggestions: [],
      isLoading: false,
      error: null,
    });
    useTeamMutationsMock.mockReturnValue({
      updateTeam: jest.fn().mockResolvedValue({
        isValid: true,
        normalizedName: "Updated Platform Team",
        normalizedServices: ["auth-service", "payments-api"],
      }),
      isUpdating: false,
    });
  });

  test("shows validation error for duplicate team name", async () => {
    const user = userEvent.setup();
    const updateTeam = jest.fn().mockResolvedValue({
      isValid: false,
      error: "teamNameUnique",
    });
    useTeamMutationsMock.mockReturnValue({ updateTeam, isUpdating: false });

    render(
      <EditTeamModal
        team={{ ...baseTeam }}
        existingTeams={[
          { ...baseTeam },
          { id: "t-2", name: "SRE Team", services: [], version: "1" },
        ]}
        closeDialog={jest.fn()}
        afterEdit={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    const nameInput = screen.getByPlaceholderText("e.g. Platform Team");
    await user.clear(nameInput);
    await user.type(nameInput, "sre team");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Team name must be unique.")).toBeInTheDocument();
    expect(updateTeam).toHaveBeenCalled();
  });

  test("shows validation error for empty team name", async () => {
    const user = userEvent.setup();
    const updateTeam = jest.fn().mockResolvedValue({
      isValid: false,
      error: "teamNameRequired",
    });
    useTeamMutationsMock.mockReturnValue({ updateTeam, isUpdating: false });

    render(
      <EditTeamModal
        team={{ ...baseTeam }}
        existingTeams={[{ ...baseTeam }]}
        closeDialog={jest.fn()}
        afterEdit={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    const nameInput = screen.getByPlaceholderText("e.g. Platform Team");
    await user.clear(nameInput);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Team name is required.")).toBeInTheDocument();
  });

  test("shows validation error when service is already assigned to another team", async () => {
    const user = userEvent.setup();

    render(
      <EditTeamModal
        team={{ ...baseTeam }}
        existingTeams={[
          { ...baseTeam },
          {
            id: "t-2",
            name: "Payments Team",
            services: ["payments-api"],
            version: "2",
          },
        ]}
        closeDialog={jest.fn()}
        afterEdit={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.type(screen.getByPlaceholderText("e.g. payments-api"), "payments-api");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(
      screen.getByText("Service is already assigned to another team."),
    ).toBeInTheDocument();
  });

  test("fills service input after selecting a suggestion", async () => {
    const user = userEvent.setup();
    useServiceSuggestionsMock.mockReturnValue({
      suggestions: ["payments-api"],
      isLoading: false,
      error: null,
    });

    render(
      <EditTeamModal
        team={{ ...baseTeam }}
        existingTeams={[{ ...baseTeam }]}
        closeDialog={jest.fn()}
        afterEdit={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole("button", { name: "payments-api" }));

    expect(screen.getByPlaceholderText("e.g. payments-api")).toHaveValue("payments-api");
  });

  test("blocks save when existing services conflict with another team", async () => {
    const user = userEvent.setup();
    const updateTeam = jest.fn().mockResolvedValue({
      isValid: false,
      error: "serviceAlreadyAssigned",
    });
    useTeamMutationsMock.mockReturnValue({ updateTeam, isUpdating: false });

    render(
      <EditTeamModal
        team={{
          id: "t-1",
          name: "Platform Team",
          services: ["shared-service"],
          version: "4",
        }}
        existingTeams={[
          {
            id: "t-1",
            name: "Platform Team",
            services: ["shared-service"],
            version: "4",
          },
          {
            id: "t-2",
            name: "Payments Team",
            services: ["shared-service"],
            version: "2",
          },
        ]}
        closeDialog={jest.fn()}
        afterEdit={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText("Service is already assigned to another team."),
    ).toBeInTheDocument();
    expect(updateTeam).toHaveBeenCalled();
  });

  test("calls afterEdit on successful submit", async () => {
    const user = userEvent.setup();
    const updateTeam = jest.fn().mockResolvedValue({
      isValid: true,
      normalizedName: "Updated Platform Team",
      normalizedServices: ["auth-service", "payments-api"],
    });
    const afterEdit = jest.fn().mockResolvedValue(undefined);
    useTeamMutationsMock.mockReturnValue({ updateTeam, isUpdating: false });

    render(
      <EditTeamModal
        team={{ ...baseTeam }}
        existingTeams={[{ ...baseTeam }]}
        closeDialog={jest.fn()}
        afterEdit={afterEdit}
      />,
    );

    const nameInput = screen.getByPlaceholderText("e.g. Platform Team");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Platform Team");
    await user.type(screen.getByPlaceholderText("e.g. payments-api"), "payments-api");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateTeam).toHaveBeenCalledWith({
        team: baseTeam,
        name: "Updated Platform Team",
        services: ["auth-service", "payments-api"],
        existingTeams: [baseTeam],
      });
    });
    expect(afterEdit).toHaveBeenCalledTimes(1);
  });
});
