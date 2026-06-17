import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import Router from "./router";
import AuricruxDock from "./components/AuricruxDock.jsx";
import RootErrorBoundary from "./components/RootErrorBoundary.jsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Application root element with id "root" was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <Router />
      <AuricruxDock />
    </RootErrorBoundary>
  </React.StrictMode>,
);
