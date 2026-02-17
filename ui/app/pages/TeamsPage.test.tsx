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
  right: React.ReactNode;
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

jest.mock("@dynatrace-sdk/react-hooks", () => ({
  useSettingsObjectsV2: jest.fn(),
}));

jest.mock("@dynatrace/strato-components/content", () => ({
  Skeleton: () => <div>Mock Skeleton</div>,
}));

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
      <button onClick={() => onEdit(teams[0])}>mock-open-edit</button>
      <button onClick={() => onDelete(teams[0])}>mock-open-delete</button>
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
  EditTeamModal: () => <div>Edit Modal Open</div>,
}));

jest.mock("app/components/teams/DeleteTeamModal", () => ({
  DeleteTeamModal: () => <div>Delete Modal Open</div>,
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
      isLoading: true,
      refetch: jest.fn(),
    });

    render(<TeamsPage />);

    expect(screen.getByText("Mock Skeleton")).toBeInTheDocument();
  });

  test("maps loaded settings items and renders TeamsTable", () => {
    useSettingsObjectsV2Mock.mockReturnValue({
      data,
      isLoading: false,
      refetch: jest.fn().mockResolvedValue(undefined),
    });

    render(<TeamsPage />);

    expect(screen.getByText("Teams")).toBeInTheDocument();
    expect(screen.getByTestId("teams-count")).toHaveTextContent("1");
  });

  test("opens create modal when Add team button is clicked", async () => {
    const user = userEvent.setup();
    useSettingsObjectsV2Mock.mockReturnValue({
      data,
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
      isLoading: false,
      refetch: jest.fn().mockResolvedValue(undefined),
    });

    render(<TeamsPage />);

    await user.click(screen.getByRole("button", { name: "mock-open-edit" }));
    expect(screen.getByText("Edit Modal Open")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "mock-open-delete" }));
    expect(screen.getByText("Delete Modal Open")).toBeInTheDocument();
  });
});
