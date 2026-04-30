import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTeamMutations } from "app/hooks/useTeamMutations";
import { AssignTeamModal } from "./AssignTeamModal";

jest.mock("app/hooks/useTeamMutations", () => ({
  useTeamMutations: jest.fn(),
}));

describe("components/teamsErrors/AssignTeamModal", () => {
  const useTeamMutationsMock = useTeamMutations as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useTeamMutationsMock.mockReturnValue({
      assignServiceToExistingTeam: jest.fn(),
      createTeamForService: jest.fn(),
      isCreating: false,
      isUpdating: false,
    });
  });

  test("defaults to create mode when there are no teams", () => {
    render(
      <AssignTeamModal
        teams={[]}
        serviceName="payments-api"
        closeDialog={jest.fn()}
        afterAssign={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByDisplayValue("")).toBeInTheDocument();
    expect(
      screen.getByText("The current service will be added automatically to the new team."),
    ).toBeInTheDocument();
  });

  test("assigns service to the selected existing team", async () => {
    const user = userEvent.setup();
    const assignServiceToExistingTeam = jest.fn().mockResolvedValue(undefined);
    const afterAssign = jest.fn().mockResolvedValue(undefined);
    useTeamMutationsMock.mockReturnValue({
      assignServiceToExistingTeam,
      createTeamForService: jest.fn(),
      isCreating: false,
      isUpdating: false,
    });

    render(
      <AssignTeamModal
        teams={[
          { id: "t-1", name: "Platform Team", services: ["auth-service"], version: "1" },
          { id: "t-2", name: "Payments Team", services: [], version: "4" },
        ]}
        serviceName="payments-api"
        closeDialog={jest.fn()}
        afterAssign={afterAssign}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Payments Team" }));
    await user.click(screen.getByRole("button", { name: "Assign" }));

    await waitFor(() => {
      expect(assignServiceToExistingTeam).toHaveBeenCalledWith({
        team: { id: "t-2", name: "Payments Team", services: [], version: "4" },
        serviceName: "payments-api",
      });
    });
    expect(afterAssign).toHaveBeenCalledTimes(1);
  });

  test("creates a new team with the current service", async () => {
    const user = userEvent.setup();
    const createTeamForService = jest.fn().mockResolvedValue({
      isValid: true,
      normalizedName: "Payments Team",
      normalizedServices: ["payments-api"],
    });
    const afterAssign = jest.fn().mockResolvedValue(undefined);
    useTeamMutationsMock.mockReturnValue({
      assignServiceToExistingTeam: jest.fn(),
      createTeamForService,
      isCreating: false,
      isUpdating: false,
    });

    render(
      <AssignTeamModal
        teams={[
          { id: "t-1", name: "Platform Team", services: ["auth-service"], version: "1" },
        ]}
        serviceName="payments-api"
        closeDialog={jest.fn()}
        afterAssign={afterAssign}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create new team" }));
    await user.type(screen.getByPlaceholderText("e.g. Platform Team"), "Payments Team");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createTeamForService).toHaveBeenCalledWith({
        name: "Payments Team",
        serviceName: "payments-api",
        existingTeams: [
          { id: "t-1", name: "Platform Team", services: ["auth-service"], version: "1" },
        ],
      });
    });
    expect(afterAssign).toHaveBeenCalledTimes(1);
  });

  test("shows validation error when creating a duplicate team name", async () => {
    const user = userEvent.setup();
    const createTeamForService = jest.fn().mockResolvedValue({
      isValid: false,
      error: "teamNameUnique",
    });
    useTeamMutationsMock.mockReturnValue({
      assignServiceToExistingTeam: jest.fn(),
      createTeamForService,
      isCreating: false,
      isUpdating: false,
    });

    render(
      <AssignTeamModal
        teams={[
          { id: "t-1", name: "Platform Team", services: ["auth-service"], version: "1" },
        ]}
        serviceName="payments-api"
        closeDialog={jest.fn()}
        afterAssign={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create new team" }));
    await user.type(screen.getByPlaceholderText("e.g. Platform Team"), "platform team");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("Team name must be unique.")).toBeInTheDocument();
  });
});
