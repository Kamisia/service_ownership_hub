import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDql, useUpdateSettingsV2 } from "@dynatrace-sdk/react-hooks";
import { EditTeamModal } from "./EditTeamModal";

jest.mock("@dynatrace-sdk/react-hooks", () => ({
  useUpdateSettingsV2: jest.fn(),
  useDql: jest.fn(),
}));

describe("components/teams/EditTeamModal", () => {
  const useUpdateSettingsV2Mock = useUpdateSettingsV2 as jest.Mock;
  const useDqlMock = useDql as jest.Mock;

  const baseTeam = {
    id: "t-1",
    name: "Platform Team",
    services: ["auth-service"],
    version: "4",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useDqlMock.mockReturnValue({
      data: { records: [] },
      isLoading: false,
    });
  });

  test("shows validation error for duplicate team name", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockResolvedValue(undefined);
    useUpdateSettingsV2Mock.mockReturnValue({ execute });

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
    expect(execute).not.toHaveBeenCalled();
  });

  test("shows validation error for empty team name", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockResolvedValue(undefined);
    useUpdateSettingsV2Mock.mockReturnValue({ execute });

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
    expect(execute).not.toHaveBeenCalled();
  });

  test("shows validation error when service is already assigned to another team", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockResolvedValue(undefined);
    useUpdateSettingsV2Mock.mockReturnValue({ execute });

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

    await user.type(
      screen.getByPlaceholderText("e.g. payments-api"),
      "payments-api",
    );
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(
      screen.getByText("Service is already assigned to another team."),
    ).toBeInTheDocument();
    expect(screen.queryByText("payments-api")).not.toBeInTheDocument();
  });

  test("fills service input after selecting a suggestion", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockResolvedValue(undefined);
    useUpdateSettingsV2Mock.mockReturnValue({ execute });
    useDqlMock.mockReturnValue({
      data: { records: [{ "service.name": "payments-api" }] },
      isLoading: false,
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

    expect(
      screen.getByPlaceholderText("e.g. payments-api"),
    ).toHaveValue("payments-api");
  });

  test("blocks save when existing services conflict with another team", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockResolvedValue(undefined);
    useUpdateSettingsV2Mock.mockReturnValue({ execute });

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
    expect(execute).not.toHaveBeenCalled();
  });

  test("calls update execute with added service and then afterEdit", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockResolvedValue(undefined);
    const afterEdit = jest.fn().mockResolvedValue(undefined);
    useUpdateSettingsV2Mock.mockReturnValue({ execute });

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
    await user.type(
      screen.getByPlaceholderText("e.g. payments-api"),
      "payments-api",
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith({
        objectId: "t-1",
        optimisticLockingVersion: "4",
        body: {
          value: {
            name: "Updated Platform Team",
            services: ["auth-service", "payments-api"],
          },
        },
      });
    });
    expect(afterEdit).toHaveBeenCalledTimes(1);
  });
});
