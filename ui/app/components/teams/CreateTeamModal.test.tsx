import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCreateSettingsV2 } from "@dynatrace-sdk/react-hooks";
import { CreateTeamModal } from "./CreateTeamModal";
import { TEAMS_SCHEMA_ID } from "../../utils/teams/constants";

jest.mock("@dynatrace-sdk/react-hooks", () => ({
  useCreateSettingsV2: jest.fn(),
}));

describe("components/teams/CreateTeamModal", () => {
  const useCreateSettingsV2Mock = useCreateSettingsV2 as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows validation error when team name already exists", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockResolvedValue(undefined);
    useCreateSettingsV2Mock.mockReturnValue({ execute });

    render(
      <CreateTeamModal
        existingTeams={[
          { id: "1", name: "Platform Team", services: [], version: "1" },
        ]}
        closeDialog={jest.fn()}
        afterSave={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.type(
      screen.getByPlaceholderText("e.g. Platform Team"),
      " platform team ",
    );
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(
      screen.getByText("Team name must be unique."),
    ).toBeInTheDocument();
    expect(execute).not.toHaveBeenCalled();
  });

  test("shows validation error when service is already assigned to another team", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockResolvedValue(undefined);
    useCreateSettingsV2Mock.mockReturnValue({ execute });

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

    await user.type(
      screen.getByPlaceholderText("e.g. auth-service"),
      "auth-service",
    );
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(
      screen.getByText("Service is already assigned to another team."),
    ).toBeInTheDocument();
    expect(screen.queryByText("auth-service")).not.toBeInTheDocument();
  });

  test("calls create execute and afterSave on successful submit", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockResolvedValue(undefined);
    const afterSave = jest.fn().mockResolvedValue(undefined);
    useCreateSettingsV2Mock.mockReturnValue({ execute });

    render(
      <CreateTeamModal
        existingTeams={[]}
        closeDialog={jest.fn()}
        afterSave={afterSave}
      />,
    );

    await user.type(screen.getByPlaceholderText("e.g. Platform Team"), "SRE");
    await user.type(
      screen.getByPlaceholderText("e.g. auth-service"),
      "payments-api",
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith({
        body: {
          schemaId: TEAMS_SCHEMA_ID,
          value: {
            name: "SRE",
            services: ["payments-api"],
          },
        },
      });
    });
    expect(afterSave).toHaveBeenCalledTimes(1);
  });

  test("shows fallback error when create request fails", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockRejectedValue(new Error("create failed"));
    const afterSave = jest.fn().mockResolvedValue(undefined);
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    useCreateSettingsV2Mock.mockReturnValue({ execute });

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
      expect(
        screen.getByText("Failed to create team."),
      ).toBeInTheDocument();
    });
    expect(afterSave).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
