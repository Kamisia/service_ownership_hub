import React from "react";
import { render } from "@dynatrace/strato-components-preview-testing/jest";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "./App";

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

jest.mock("./components/Header", () => ({
  Header: () => <div>Mock Header</div>,
}));

jest.mock("./pages/TeamsPage", () => ({
  __esModule: true,
  default: () => <div>Mock Teams Page</div>,
}));

jest.mock("./pages/TeamsErrorsPage", () => ({
  __esModule: true,
  default: () => <div>Mock Teams Errors Page</div>,
}));

describe("App", () => {
  test("renders TeamsPage on route /", () => {
    render(
      <MemoryRouter initialEntries={["/"]} future={routerFuture}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Mock Header")).toBeInTheDocument();
    expect(screen.getByText("Mock Teams Page")).toBeInTheDocument();
  });

  test("renders TeamsErrorsPage on route /data", () => {
    render(
      <MemoryRouter initialEntries={["/data"]} future={routerFuture}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Mock Header")).toBeInTheDocument();
    expect(screen.getByText("Mock Teams Errors Page")).toBeInTheDocument();
  });
});
