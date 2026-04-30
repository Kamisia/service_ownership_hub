import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamsErrorsTable } from "./TeamsErrorsTable";

describe("components/teamsErrors/TeamsErrorsTable", () => {
  test("renders timestamp, service, team, content and actions columns", () => {
    render(
      <TeamsErrorsTable
        rows={[
          {
            timestampText: "2026-02-17 10:00:00",
            serviceName: "auth-service",
            team: "Platform Team",
            content: "error message",
            isAssigned: true,
          },
        ]}
        onAssignTeam={jest.fn()}
      />,
    );

    expect(screen.getByText("Timestamp")).toBeInTheDocument();
    expect(screen.getByText("Service")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  test("renders provided rows in the table", () => {
    render(
      <TeamsErrorsTable
        rows={[
          {
            timestampText: "2026-02-17 10:00:00",
            serviceName: "auth-service",
            team: "Platform Team",
            content: "error message",
            isAssigned: true,
          },
          {
            timestampText: "2026-02-17 11:00:00",
            serviceName: "payments-api",
            team: "Unassigned",
            content: "timeout",
            isAssigned: false,
          },
        ]}
        onAssignTeam={jest.fn()}
      />,
    );

    expect(screen.getByText("2026-02-17 10:00:00")).toBeInTheDocument();
    expect(screen.getByText("auth-service")).toBeInTheDocument();
    expect(screen.getByText("Platform Team")).toBeInTheDocument();
    expect(screen.getByText("error message")).toBeInTheDocument();

    expect(screen.getByText("2026-02-17 11:00:00")).toBeInTheDocument();
    expect(screen.getByText("payments-api")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("timeout")).toBeInTheDocument();
  });

  test("shows assign team action only for unassigned rows", async () => {
    const user = userEvent.setup();
    const onAssignTeam = jest.fn();

    render(
      <TeamsErrorsTable
        rows={[
          {
            timestampText: "2026-02-17 10:00:00",
            serviceName: "auth-service",
            team: "Platform Team",
            content: "error message",
            isAssigned: true,
          },
          {
            timestampText: "2026-02-17 11:00:00",
            serviceName: "payments-api",
            team: "Unassigned",
            content: "timeout",
            isAssigned: false,
          },
        ]}
        onAssignTeam={onAssignTeam}
      />,
    );

    const unassignedRow = screen.getByText("payments-api").closest('[role="row"]');
    expect(unassignedRow).toBeInstanceOf(HTMLElement);
    if (!(unassignedRow instanceof HTMLElement)) {
      throw new Error("Unassigned row was not found");
    }

    const assignedRow = screen.getByText("auth-service").closest('[role="row"]');
    expect(assignedRow).toBeInstanceOf(HTMLElement);
    if (!(assignedRow instanceof HTMLElement)) {
      throw new Error("Assigned row was not found");
    }

    expect(
      within(assignedRow).queryByRole("button", { name: "Assign team" }),
    ).not.toBeInTheDocument();

    await user.click(
      within(unassignedRow).getByRole("button", { name: "Assign team" }),
    );

    expect(onAssignTeam).toHaveBeenCalledWith({
      timestampText: "2026-02-17 11:00:00",
      serviceName: "payments-api",
      team: "Unassigned",
      content: "timeout",
      isAssigned: false,
    });
  });
});
