import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen } from "@testing-library/react";
import { TeamsErrorsTable } from "./TeamsErrorsTable";

describe("components/teamsErrors/TeamsErrorsTable", () => {
  test("renders timestamp, service, team, and content columns", () => {
    render(
      <TeamsErrorsTable
        rows={[
          {
            timestampText: "2026-02-17 10:00:00",
            serviceName: "auth-service",
            team: "Platform Team",
            content: "error message",
          },
        ]}
      />,
    );

    expect(screen.getByText("Timestamp")).toBeInTheDocument();
    expect(screen.getByText("Service")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
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
          },
          {
            timestampText: "2026-02-17 11:00:00",
            serviceName: "payments-api",
            team: "Payments Team",
            content: "timeout",
          },
        ]}
      />,
    );

    expect(screen.getByText("2026-02-17 10:00:00")).toBeInTheDocument();
    expect(screen.getByText("auth-service")).toBeInTheDocument();
    expect(screen.getByText("Platform Team")).toBeInTheDocument();
    expect(screen.getByText("error message")).toBeInTheDocument();

    expect(screen.getByText("2026-02-17 11:00:00")).toBeInTheDocument();
    expect(screen.getByText("payments-api")).toBeInTheDocument();
    expect(screen.getByText("Payments Team")).toBeInTheDocument();
    expect(screen.getByText("timeout")).toBeInTheDocument();
  });
});
