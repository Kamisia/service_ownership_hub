import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { act, screen, waitFor } from "@testing-library/react";
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
  isAssigned: boolean;
};

type TeamsErrorsTableProps = {
  rows: TeamsErrorRow[];
  onAssignTeam: (row: TeamsErrorRow) => void;
};

jest.mock("@dynatrace-sdk/react-hooks", () => ({
  useDql: jest.fn(),
  useSettingsObjectsV2: jest.fn(),
}));

jest.mock("@dynatrace/strato-components/content", () => ({
  Skeleton: () => <div>Mock Skeleton</div>,
}));

jest.mock("@dynatrace/strato-components-preview/content", () => {
  function MockMessageContainer({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  }
  function MockMessageContainerTitle({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  }
  function MockMessageContainerDescription({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  }

  const MessageContainer = MockMessageContainer as typeof MockMessageContainer & {
    Title: typeof MockMessageContainerTitle;
    Description: typeof MockMessageContainerDescription;
  };
  MessageContainer.Title = MockMessageContainerTitle;
  MessageContainer.Description = MockMessageContainerDescription;
  return { MessageContainer };
});

jest.mock("../dql/teamsErrorsQuery", () => ({
  DEFAULT_ERRORS_LIMIT: 100,
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

jest.mock("app/components/teamsErrors/AssignTeamModal", () => ({
  AssignTeamModal: ({ serviceName }: { serviceName: string }) => (
    <div>Assign Modal Open: {serviceName}</div>
  ),
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
    useSettingsObjectsV2Mock.mockReturnValue({
      data: { items: [] },
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });
    useDqlMock.mockReturnValue({
      data: { records: [] },
      isLoading: false,
      isFetching: false,
      error: undefined,
      forceRefetch: jest.fn(),
      refetch: jest.fn(),
    });
  });

  test("builds DQL query from teams mapping and executes useDql with enabled flag", () => {
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
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<TeamsErrorsPage />);

    expect(parseTeamsMapMock).toHaveBeenCalledTimes(1);
    expect(buildQueryMock).toHaveBeenCalledWith("mock-records");
    expect(useDqlMock).toHaveBeenCalledWith(
      { query: "mock-query" },
      expect.objectContaining({ enabled: true, staleTime: 60000 }),
    );
  });

  test("maps DQL records to TeamsErrorRow shape with unassigned team fallback", () => {
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
      isFetching: false,
      error: undefined,
      forceRefetch: jest.fn(),
      refetch: jest.fn(),
    });

    render(<TeamsErrorsPage />);

    expect(teamsErrorsTableMock).toHaveBeenCalledTimes(1);
    const rows = teamsErrorsTableMock.mock.calls[0][0].rows;

    expect(rows).toEqual([
      {
        timestampText: "formatted-2026-02-17T10:00:00.000Z",
        content: "boom",
        isAssigned: true,
        team: "Platform Team",
        serviceName: "auth-service",
      },
      {
        timestampText: "formatted-2026-02-17T11:00:00.000Z",
        content: "",
        isAssigned: false,
        team: "Unassigned",
        serviceName: "",
      },
    ]);
  });

  test("filters rows by service, team, and content case-insensitively", async () => {
    const user = userEvent.setup();
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
      isFetching: false,
      error: undefined,
      forceRefetch: jest.fn(),
      refetch: jest.fn(),
    });

    render(<TeamsErrorsPage />);

    await user.type(screen.getByPlaceholderText(/Filter by service/i), "platform");

    const lastCallIndex = teamsErrorsTableMock.mock.calls.length - 1;
    const rows = teamsErrorsTableMock.mock.calls[lastCallIndex][0].rows;

    expect(rows).toHaveLength(1);
    expect(rows[0].team).toBe("Platform Team");
  });

  test("opens assign modal for unassigned service", () => {
    useDqlMock.mockReturnValue({
      data: {
        records: [
          {
            timestamp: "1",
            content: "DB timeout",
            "service.name": "payments-api",
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      forceRefetch: jest.fn(),
      refetch: jest.fn(),
    });

    render(<TeamsErrorsPage />);

    const props = teamsErrorsTableMock.mock.calls[0][0];
    act(() => {
      props.onAssignTeam(props.rows[0]);
    });

    expect(screen.getByText("Assign Modal Open: payments-api")).toBeInTheDocument();
  });

  test("forces ownership and logs refresh when Refresh button is clicked", async () => {
    const user = userEvent.setup();
    const ownershipRefetch = jest.fn().mockResolvedValue(undefined);
    const forceRefetch = jest.fn().mockResolvedValue(undefined);
    const refetch = jest.fn().mockResolvedValue(undefined);

    useSettingsObjectsV2Mock.mockReturnValue({
      data: { items: [] },
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: ownershipRefetch,
    });

    useDqlMock.mockReturnValue({
      data: { records: [] },
      isLoading: false,
      isFetching: false,
      error: undefined,
      forceRefetch,
      refetch,
    });

    render(<TeamsErrorsPage />);

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(ownershipRefetch).toHaveBeenCalledTimes(1);
      expect(forceRefetch).toHaveBeenCalledWith({ cancelRefetch: true });
    });
  });

  test("renders ownership loading state before logs query", () => {
    useSettingsObjectsV2Mock.mockReturnValue({
      data: undefined,
      error: undefined,
      isError: false,
      isLoading: true,
      refetch: jest.fn(),
    });

    render(<TeamsErrorsPage />);

    expect(screen.getByText("Loading ownership mapping...")).toBeInTheDocument();
    expect(useDqlMock).toHaveBeenCalledWith(
      { query: "mock-query" },
      expect.objectContaining({ enabled: false }),
    );
  });

  test("renders ownership error state and retries settings fetch", async () => {
    const user = userEvent.setup();
    const refetch = jest.fn().mockResolvedValue(undefined);
    useSettingsObjectsV2Mock.mockReturnValue({
      data: undefined,
      error: new Error("settings boom"),
      isError: true,
      isLoading: false,
      refetch,
    });

    render(<TeamsErrorsPage />);

    expect(screen.getByText(/Failed to load ownership mapping:/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test("renders log query error state", () => {
    useDqlMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: new Error("boom"),
      forceRefetch: jest.fn(),
      refetch: jest.fn(),
    });

    render(<TeamsErrorsPage />);
    expect(screen.getByText(/Failed to load logs:/)).toBeInTheDocument();
  });

  test("renders empty state when there are no rows", () => {
    render(<TeamsErrorsPage />);

    expect(
      screen.getByText("No matching ERROR logs were found for the selected timeframe."),
    ).toBeInTheDocument();
  });
});
