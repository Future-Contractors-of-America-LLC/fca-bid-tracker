import React from "react";
import ReactDOM from "react-dom/client";
import Router from "./router";
import AuricruxDock from "./components/AuricruxDock.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router />
    <AuricruxDock />
  </React.StrictMode>
);