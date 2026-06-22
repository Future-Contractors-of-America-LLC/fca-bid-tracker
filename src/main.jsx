import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { ensureProductHostContinuity } from "./hostContinuity";
import Router from "./router";
import RootErrorBoundary from "./components/RootErrorBoundary.jsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Application root element with id "root" was not found.');
}

if (!ensureProductHostContinuity()) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RootErrorBoundary>
        <Router />
      </RootErrorBoundary>
    </React.StrictMode>,
  );
}
