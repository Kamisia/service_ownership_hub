import { Page } from "@dynatrace/strato-components-preview/layouts";
import React from "react";
import { Route, Routes } from "react-router-dom";
import  TeamsError  from "./pages/TeamsError";
import { Header } from "./components/Header";
import   Teams  from "./pages/Teams";
export const App = () => {
  return (
    <Page>
      <Page.Header>
        <Header />
      </Page.Header>
      <Page.Main>
        <Routes>
         <Route path="/" element={<Teams />} />
          <Route path="/data" element={<TeamsError />} />
        </Routes>
      </Page.Main>
    </Page>
  );
};
