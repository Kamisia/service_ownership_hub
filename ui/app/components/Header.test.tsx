import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./Header";

jest.mock("@dynatrace-sdk/app-environment", () => ({
  getAppName: () => "Service Ownership Hub",
  getAppId: () => "service-ownership-hub",
}));

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe("components/Header", () => {
  test("renders nav links to / and /data", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]} future={routerFuture}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByText("Teams Error")).toBeInTheDocument();

    const homeLink = container.querySelector('a[href="/"]');
    const dataLink = container.querySelector('a[href="/data"]');

    expect(homeLink).toBeInTheDocument();
    expect(dataLink).toBeInTheDocument();
  });

  test("navigates to /data when Teams Error link is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]} future={routerFuture}>
        <Header />
        <Routes>
          <Route path="*" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("location")).toHaveTextContent("/");

    await user.click(screen.getByRole("link", { name: "Teams Error" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/data");
  });
});
