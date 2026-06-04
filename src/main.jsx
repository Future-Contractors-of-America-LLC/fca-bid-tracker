import React from "react";
import ReactDOM from "react-dom/client";
import Router from "./router";
import AuricruxDock from "./components/AuricruxDock.jsx";
import RootErrorBoundary from "./components/RootErrorBoundary.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <Router />
      <AuricruxDock />
    </RootErrorBoundary>
  </React.StrictMode>
);
