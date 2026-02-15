import React from "react";
import ReactDOM from "react-dom/client";
import { AppRoot } from "@dynatrace/strato-components/core";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";
import { QueryClient, QueryClientProvider } from "react-query";

const root = ReactDOM.createRoot(document.getElementById("root")!);
const queryClient = new QueryClient()
console.log("main rendered")

root.render(
  <AppRoot>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="ui">
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </AppRoot>
);
