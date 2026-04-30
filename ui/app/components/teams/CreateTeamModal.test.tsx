import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useServiceSuggestions } from "app/hooks/useServiceSuggestions";
import { useTeamMutations } from "app/hooks/useTeamMutations";
import { CreateTeamModal } from "./CreateTeamModal";

jest.mock("app/hooks/useServiceSuggestions", () => ({
  useServiceSuggestions: jest.fn(),
}));

jest.mock("app/hooks/useTeamMutations", () => ({
  useTeamMutations: jest.fn(),
}));

describe("components/teams/CreateTeamModal", () => {
  const useServiceSuggestionsMock = useServiceSuggestions as jest.Mock;
  const useTeamMutationsMock = useTeamMutations as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useServiceSuggestionsMock.mockReturnValue({
      suggestions: [],
      isLoading: false,
      error: null,
    });
    useTeamMutationsMock.mockReturnValue({
      createTeam: jest.fn().mockResolvedValue({
        isValid: true,
        normalizedName: "SRE",
        normalizedServices: ["payments-api"],
      }),
      isCreating: false,
    });
  });

  test("shows validation error when team name already exists", async () => {
    const user = userEvent.setup();
    const createTeam = jest.fn().mockResolvedValue({
      isValid: false,
      error: "teamNameUnique",
    });
    useTeamMutationsMock.mockReturnValue({ createTeam, isCreating: false });

    render(
      <CreateTeamModal
        existingTeams={[{ id: "1", name: "Platform Team", services: [], version: "1" }]}
        closeDialog={jest.fn()}
        afterSave={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.type(screen.getByPlaceholderText("e.g. Platform Team"), " platform team ");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("Team name must be unique.")).toBeInTheDocument();
    expect(createTeam).toHaveBeenCalled();
  });

  test("shows validation error when service is already assigned to another team", async () => {
    const user = userEvent.setup();

    render(
      <CreateTeamModal
        existingTeams={[
          {
            id: "t-1",
            name: "Platform Team",
            services: ["auth-service"],
            version: "1",
          },
        ]}
        closeDialog={jest.fn()}
        afterSave={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.type(screen.getByPlaceholderText("e.g. auth-service"), "auth-service");
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
      <CreateTeamModal
        existingTeams={[]}
        closeDialog={jest.fn()}
        afterSave={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole("button", { name: "payments-api" }));

    expect(screen.getByPlaceholderText("e.g. auth-service")).toHaveValue("payments-api");
  });

  test("blocks submit when service conflict is detected at save time", async () => {
    const user = userEvent.setup();
    const createTeam = jest.fn().mockResolvedValue({
      isValid: false,
      error: "serviceAlreadyAssigned",
    });
    const afterSave = jest.fn().mockResolvedValue(undefined);
    useTeamMutationsMock.mockReturnValue({ createTeam, isCreating: false });

    render(
      <CreateTeamModal
        existingTeams={[]}
        closeDialog={jest.fn()}
        afterSave={afterSave}
      />,
    );

    await user.type(screen.getByPlaceholderText("e.g. Platform Team"), "SRE");
    await user.type(screen.getByPlaceholderText("e.g. auth-service"), "payments-api");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(
      screen.getByText("Service is already assigned to another team."),
    ).toBeInTheDocument();
    expect(afterSave).not.toHaveBeenCalled();
  });

  test("calls afterSave on successful submit", async () => {
    const user = userEvent.setup();
    const createTeam = jest.fn().mockResolvedValue({
      isValid: true,
      normalizedName: "SRE",
      normalizedServices: ["payments-api"],
    });
    const afterSave = jest.fn().mockResolvedValue(undefined);
    useTeamMutationsMock.mockReturnValue({ createTeam, isCreating: false });

    render(
      <CreateTeamModal
        existingTeams={[]}
        closeDialog={jest.fn()}
        afterSave={afterSave}
      />,
    );

    await user.type(screen.getByPlaceholderText("e.g. Platform Team"), "SRE");
    await user.type(screen.getByPlaceholderText("e.g. auth-service"), "payments-api");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createTeam).toHaveBeenCalledWith({
        name: "SRE",
        services: ["payments-api"],
        existingTeams: [],
      });
    });
    expect(afterSave).toHaveBeenCalledTimes(1);
  });

  test("shows fallback error when create request fails", async () => {
    const user = userEvent.setup();
    const createTeam = jest.fn().mockRejectedValue(new Error("create failed"));
    const afterSave = jest.fn().mockResolvedValue(undefined);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    useTeamMutationsMock.mockReturnValue({ createTeam, isCreating: false });

    render(
      <CreateTeamModal
        existingTeams={[]}
        closeDialog={jest.fn()}
        afterSave={afterSave}
      />,
    );

    await user.type(screen.getByPlaceholderText("e.g. Platform Team"), "SRE");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(screen.getByText("Failed to create team.")).toBeInTheDocument();
    });
    expect(afterSave).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
