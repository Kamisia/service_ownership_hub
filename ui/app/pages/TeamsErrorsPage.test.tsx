import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDql, useSettingsObjectsV2 } from "@dynatrace-sdk/react-hooks";
import TeamsErrorsPage from "./TeamsErrorsPage";
import { buildQuery } from "../dql/teamsErrorsQuery";
import { formatTs, parseTeamsMap } from "../dql/teamsErrorsUtils";

type TeamsErrorRow = {
  timestampText: string;
  serviceName: string;
  team: string;
  content: string;
};

type TeamsErrorsTableProps = {
  rows: TeamsErrorRow[];
};

jest.mock("@dynatrace-sdk/react-hooks", () => ({
  useDql: jest.fn(),
  useSettingsObjectsV2: jest.fn(),
}));

jest.mock("../dql/teamsErrorsQuery", () => ({
  buildQuery: jest.fn(),
}));

jest.mock("../dql/teamsErrorsUtils", () => ({
  formatTs: jest.fn(),
  parseTeamsMap: jest.fn(),
}));

const teamsErrorsTableMock = jest.fn<React.JSX.Element, [TeamsErrorsTableProps]>(({ rows }) => (
  <div data-testid="rows-json">{JSON.stringify(rows)}</div>
));

jest.mock("../components/teamsErrors/TeamsErrorsTable", () => ({
  TeamsErrorsTable: (props: TeamsErrorsTableProps) => teamsErrorsTableMock(props),
}));

describe("pages/TeamsErrorsPage", () => {
  const useSettingsObjectsV2Mock = useSettingsObjectsV2 as jest.Mock;
  const useDqlMock = useDql as jest.Mock;
  const buildQueryMock = buildQuery as jest.Mock;
  const parseTeamsMapMock = parseTeamsMap as jest.Mock;
  const formatTsMock = formatTs as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    parseTeamsMapMock.mockReturnValue("mock-records");
    buildQueryMock.mockReturnValue("mock-query");
    formatTsMock.mockImplementation((ts: string | number) => `formatted-${ts}`);
  });

  test("builds DQL query from teams mapping and executes useDql", () => {
    useSettingsObjectsV2Mock.mockReturnValue({
      data: {
        items: [
          {
            objectId: "t-1",
            version: "1",
            value: { name: "Platform Team", services: ["auth-service"] },
          },
        ],
      },
    });

    useDqlMock.mockReturnValue({
      data: { records: [] },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<TeamsErrorsPage />);

    expect(parseTeamsMapMock).toHaveBeenCalledTimes(1);
    expect(buildQueryMock).toHaveBeenCalledWith("mock-records");
    expect(useDqlMock).toHaveBeenCalledWith({ query: "mock-query" });
  });

  test("maps DQL records to TeamsErrorRow shape with fallbacks", () => {
    useSettingsObjectsV2Mock.mockReturnValue({ data: { items: [] } });
    useDqlMock.mockReturnValue({
      data: {
        records: [
          {
            timestamp: "2026-02-17T10:00:00.000Z",
            content: "boom",
            team: "Platform Team",
            "service.name": "auth-service",
          },
          {
            timestamp: "2026-02-17T11:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<TeamsErrorsPage />);

    expect(teamsErrorsTableMock).toHaveBeenCalledTimes(1);
    const rows = teamsErrorsTableMock.mock.calls[0][0].rows;

    expect(rows).toEqual([
      {
        timestampText: "formatted-2026-02-17T10:00:00.000Z",
        content: "boom",
        team: "Platform Team",
        serviceName: "auth-service",
      },
      {
        timestampText: "formatted-2026-02-17T11:00:00.000Z",
        content: "",
        team: "",
        serviceName: "",
      },
    ]);
  });

  test("filters rows by service, team, and content case-insensitively", async () => {
    const user = userEvent.setup();
    useSettingsObjectsV2Mock.mockReturnValue({ data: { items: [] } });
    useDqlMock.mockReturnValue({
      data: {
        records: [
          {
            timestamp: "1",
            content: "DB timeout",
            team: "Platform Team",
            "service.name": "auth-service",
          },
          {
            timestamp: "2",
            content: "Cache miss",
            team: "SRE Team",
            "service.name": "cache-service",
          },
        ],
      },
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<TeamsErrorsPage />);

    await user.type(screen.getByPlaceholderText(/Filter by service/i), "platform");

    const lastCallIndex = teamsErrorsTableMock.mock.calls.length - 1;
    const rows = teamsErrorsTableMock.mock.calls[lastCallIndex][0].rows;

    expect(rows).toHaveLength(1);
    expect(rows[0].team).toBe("Platform Team");
  });

  test("calls refetch when Refresh button is clicked", async () => {
    const user = userEvent.setup();
    const refetch = jest.fn().mockResolvedValue(undefined);

    useSettingsObjectsV2Mock.mockReturnValue({ data: { items: [] } });
    useDqlMock.mockReturnValue({
      data: { records: [] },
      isLoading: false,
      error: undefined,
      refetch,
    });

    render(<TeamsErrorsPage />);

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });

  test("renders loading and error states correctly", () => {
    useSettingsObjectsV2Mock.mockReturnValue({ data: { items: [] } });

    useDqlMock.mockReturnValueOnce({
      data: { records: [] },
      isLoading: true,
      error: undefined,
      refetch: jest.fn(),
    });

    const { unmount } = render(<TeamsErrorsPage />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();

    unmount();

    useDqlMock.mockReturnValueOnce({
      data: { records: [] },
      isLoading: false,
      error: new Error("boom"),
      refetch: jest.fn(),
    });

    render(<TeamsErrorsPage />);
    expect(screen.getByText(/Failed to load logs:/)).toBeInTheDocument();
  });
});
