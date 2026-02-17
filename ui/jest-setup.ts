import "@testing-library/jest-dom";

jest.mock("@dynatrace-sdk/user-preferences", () => ({
  getTimezone: () => "UTC",
}));
