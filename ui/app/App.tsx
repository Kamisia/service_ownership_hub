import { Page } from "@dynatrace/strato-components-preview/layouts";
import React from "react";
import { Route, Routes } from "react-router-dom";
import TeamsErrorPage from "./pages/TeamsErrorsPage";
import { Header } from "./components/Header";
import TeamsPage from "./pages/TeamsPage";
export const App = () => {
  return (
    <Page>
      <Page.Header>
        <Header />
      </Page.Header>
      <Page.Main>
        <Routes>
          <Route path="/" element={<TeamsErrorPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/data" element={<TeamsErrorPage />} />
        </Routes>
      </Page.Main>
    </Page>
  );
};
