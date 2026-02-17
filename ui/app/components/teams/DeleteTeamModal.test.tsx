import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDeleteSettingsV2 } from "@dynatrace-sdk/react-hooks";
import { DeleteTeamModal } from "./DeleteTeamModal";

jest.mock("@dynatrace-sdk/react-hooks", () => ({
  useDeleteSettingsV2: jest.fn(),
}));

describe("components/teams/DeleteTeamModal", () => {
  const useDeleteSettingsV2Mock = useDeleteSettingsV2 as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls delete execute with objectId and optimisticLockingVersion", async () => {
    const user = userEvent.setup();
    const execute = jest.fn().mockResolvedValue(undefined);
    const afterDelete = jest.fn().mockResolvedValue(undefined);
    useDeleteSettingsV2Mock.mockReturnValue({ execute });

    render(
      <DeleteTeamModal
        team={{
          id: "team-44",
          name: "Platform Team",
          services: ["auth-service"],
          version: "9",
        }}
        closeDialog={jest.fn()}
        afterDelete={afterDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith({
        objectId: "team-44",
        optimisticLockingVersion: "9",
      });
    });
    expect(afterDelete).toHaveBeenCalledTimes(1);
  });
});
