import React from "react";
import ReactDOM from "react-dom/client";
import { AppRoot } from "@dynatrace/strato-components/core";
import { BrowserRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { App } from "./app/App";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <AppRoot>
    <IntlProvider locale="en" messages={{}}>
      <BrowserRouter basename="ui">
        <App />
      </BrowserRouter>
    </IntlProvider>
  </AppRoot>,
);
