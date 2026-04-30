import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSettingsObjectsV2 } from "@dynatrace-sdk/react-hooks";
import TeamsPage from "./TeamsPage";

type MockTeam = {
  id: string;
  name: string;
  services: string[];
  version: string;
};

type MockPageSectionProps = {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

type MockTeamsTableProps = {
  teams: MockTeam[];
  onEdit: (team: MockTeam) => void;
  onDelete: (team: MockTeam) => void;
};

type MockCreateTeamModalProps = {
  afterSave: () => Promise<void>;
};
type MockEditTeamModalProps = {
  afterEdit: () => Promise<void>;
};
type MockDeleteTeamModalProps = {
  afterDelete: () => Promise<void>;
};

jest.mock("@dynatrace-sdk/react-hooks", () => ({
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

jest.mock("app/components/layout/PageSection", () => ({
  PageSection: ({ title, right, children }: MockPageSectionProps) => (
    <section>
      <h1>{title}</h1>
      <div>{right}</div>
      <div>{children}</div>
    </section>
  ),
}));

jest.mock("app/components/teams/TeamsTable", () => ({
  TeamsTable: ({ teams, onEdit, onDelete }: MockTeamsTableProps) => (
    <div>
      <div data-testid="teams-count">{teams.length}</div>
      {teams[0] && <button onClick={() => onEdit(teams[0])}>mock-open-edit</button>}
      {teams[0] && <button onClick={() => onDelete(teams[0])}>mock-open-delete</button>}
    </div>
  ),
}));

jest.mock("app/components/teams/CreateTeamModal", () => ({
  CreateTeamModal: ({ afterSave }: MockCreateTeamModalProps) => (
    <div>
      <div>Create Modal Open</div>
      <button onClick={() => void afterSave()}>mock-create-save</button>
    </div>
  ),
}));

jest.mock("app/components/teams/EditTeamModal", () => ({
  EditTeamModal: ({ afterEdit }: MockEditTeamModalProps) => (
    <div>
      <div>Edit Modal Open</div>
      <button onClick={() => void afterEdit()}>mock-edit-save</button>
    </div>
  ),
}));

jest.mock("app/components/teams/DeleteTeamModal", () => ({
  DeleteTeamModal: ({ afterDelete }: MockDeleteTeamModalProps) => (
    <div>
      <div>Delete Modal Open</div>
      <button onClick={() => void afterDelete()}>mock-delete-confirm</button>
    </div>
  ),
}));

describe("pages/TeamsPage", () => {
  const useSettingsObjectsV2Mock = useSettingsObjectsV2 as jest.Mock;

  const data = {
    items: [
      {
        objectId: "t-1",
        version: "1",
        value: {
          name: "Platform Team",
          services: ["auth-service"],
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders skeleton when settings query is loading", () => {
    useSettingsObjectsV2Mock.mockReturnValue({
      data: undefined,
      error: undefined,
      isError: false,
      isLoading: true,
      refetch: jest.fn(),
    });

    render(<TeamsPage />);

    expect(screen.getByText("Mock Skeleton")).toBeInTheDocument();
  });

  test("renders retry state when settings query fails", async () => {
    const user = userEvent.setup();
    const refetch = jest.fn().mockResolvedValue(undefined);
    useSettingsObjectsV2Mock.mockReturnValue({
      data: undefined,
      error: new Error("boom"),
      isError: true,
      isLoading: false,
      refetch,
    });

    render(<TeamsPage />);

    expect(screen.getByText(/Failed to load team ownership data:/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test("maps loaded settings items and renders TeamsTable", () => {
    useSettingsObjectsV2Mock.mockReturnValue({
      data,
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: jest.fn().mockResolvedValue(undefined),
    });

    render(<TeamsPage />);

    expect(screen.getByText("Teams")).toBeInTheDocument();
    expect(screen.getByTestId("teams-count")).toHaveTextContent("1");
  });

  test("shows empty state when there are no teams", () => {
    useSettingsObjectsV2Mock.mockReturnValue({
      data: { items: [] },
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: jest.fn().mockResolvedValue(undefined),
    });

    render(<TeamsPage />);

    expect(screen.getByText("No teams configured yet.")).toBeInTheDocument();
  });

  test("opens create modal when Add team button is clicked", async () => {
    const user = userEvent.setup();
    useSettingsObjectsV2Mock.mockReturnValue({
      data,
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: jest.fn().mockResolvedValue(undefined),
    });

    render(<TeamsPage />);

    await user.click(screen.getByRole("button", { name: "Add team +" }));

    expect(screen.getByText("Create Modal Open")).toBeInTheDocument();
  });

  test("refetches data and closes create modal after save", async () => {
    const user = userEvent.setup();
    const refetch = jest.fn().mockResolvedValue(undefined);

    useSettingsObjectsV2Mock.mockReturnValue({
      data,
      error: undefined,
      isError: false,
      isLoading: false,
      refetch,
    });

    render(<TeamsPage />);

    await user.click(screen.getByRole("button", { name: "Add team +" }));
    await user.click(screen.getByRole("button", { name: "mock-create-save" }));

    await waitFor(() => {
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText("Create Modal Open")).not.toBeInTheDocument();
  });

  test("opens edit and delete modals from table callbacks", async () => {
    const user = userEvent.setup();
    useSettingsObjectsV2Mock.mockReturnValue({
      data,
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: jest.fn().mockResolvedValue(undefined),
    });

    render(<TeamsPage />);

    await user.click(screen.getByRole("button", { name: "mock-open-edit" }));
    expect(screen.getByText("Edit Modal Open")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "mock-open-delete" }));
    expect(screen.getByText("Delete Modal Open")).toBeInTheDocument();
  });

  test("refetches data and closes edit modal after edit", async () => {
    const user = userEvent.setup();
    const refetch = jest.fn().mockResolvedValue(undefined);

    useSettingsObjectsV2Mock.mockReturnValue({
      data,
      error: undefined,
      isError: false,
      isLoading: false,
      refetch,
    });

    render(<TeamsPage />);

    await user.click(screen.getByRole("button", { name: "mock-open-edit" }));
    expect(screen.getByText("Edit Modal Open")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "mock-edit-save" }));

    await waitFor(() => {
      expect(refetch).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByText("Edit Modal Open")).not.toBeInTheDocument();
  });

  test("refetches data and closes delete modal after delete", async () => {
    const user = userEvent.setup();
    const refetch = jest.fn().mockResolvedValue(undefined);

    useSettingsObjectsV2Mock.mockReturnValue({
      data,
      error: undefined,
      isError: false,
      isLoading: false,
      refetch,
    });

    render(<TeamsPage />);

    await user.click(screen.getByRole("button", { name: "mock-open-delete" }));
    expect(screen.getByText("Delete Modal Open")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "mock-delete-confirm" }));

    await waitFor(() => {
      expect(refetch).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByText("Delete Modal Open")).not.toBeInTheDocument();
  });
});
