import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTeamMutations } from "app/hooks/useTeamMutations";
import { DeleteTeamModal } from "./DeleteTeamModal";

jest.mock("app/hooks/useTeamMutations", () => ({
  useTeamMutations: jest.fn(),
}));

describe("components/teams/DeleteTeamModal", () => {
  const useTeamMutationsMock = useTeamMutations as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls deleteTeam with selected team", async () => {
    const user = userEvent.setup();
    const deleteTeam = jest.fn().mockResolvedValue(undefined);
    const afterDelete = jest.fn().mockResolvedValue(undefined);
    useTeamMutationsMock.mockReturnValue({
      deleteTeam,
      isDeleting: false,
    });

    const team = {
      id: "team-44",
      name: "Platform Team",
      services: ["auth-service"],
      version: "9",
    };

    render(
      <DeleteTeamModal
        team={team}
        closeDialog={jest.fn()}
        afterDelete={afterDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteTeam).toHaveBeenCalledWith(team);
    });
    expect(afterDelete).toHaveBeenCalledTimes(1);
  });
});
