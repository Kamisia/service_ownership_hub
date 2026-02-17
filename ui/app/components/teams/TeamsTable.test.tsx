import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamsTable } from "./TeamsTable";

describe("components/teams/TeamsTable", () => {
  const teams = [
    {
      id: "t-1",
      name: "Platform Team",
      services: ["auth-service", "payments-api"],
      version: "1",
    },
    {
      id: "t-2",
      name: "SRE Team",
      services: [],
      version: "1",
    },
  ];

  test("renders team and services columns with row data", () => {
    render(<TeamsTable teams={teams} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();

    expect(screen.getByText("Platform Team")).toBeInTheDocument();
    expect(screen.getByText("auth-service")).toBeInTheDocument();
    expect(screen.getByText("payments-api")).toBeInTheDocument();
  });

  test("shows No services text when team has empty services list", () => {
    render(<TeamsTable teams={teams} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("No services")).toBeInTheDocument();
    expect(screen.getByText("SRE Team")).toBeInTheDocument();
  });

  test("calls onEdit with row data when Edit is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    render(<TeamsTable teams={teams} onEdit={onEdit} onDelete={jest.fn()} />);

    const platformRow = screen
      .getByText("Platform Team")
      .closest('[role="row"]');
    expect(platformRow).toBeInstanceOf(HTMLElement);
    if (!(platformRow instanceof HTMLElement)) {
      throw new Error("Platform Team row was not found");
    }

    await user.click(within(platformRow).getByRole("button", { name: "Edit" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(teams[0]);
  });

  test("calls onDelete with row data when Delete is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    render(<TeamsTable teams={teams} onEdit={jest.fn()} onDelete={onDelete} />);

    const platformRow = screen
      .getByText("Platform Team")
      .closest('[role="row"]');
    expect(platformRow).toBeInstanceOf(HTMLElement);
    if (!(platformRow instanceof HTMLElement)) {
      throw new Error("Platform Team row was not found");
    }

    await user.click(within(platformRow).getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(teams[0]);
  });
});
