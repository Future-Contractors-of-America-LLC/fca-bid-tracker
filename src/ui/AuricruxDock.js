import React from 'react';
import AuricruxDock from '../auricrux_engine';

const context = {
  account: "Demo Customer",
  project: "Demo Project",
  nextActions: "Explore Academy Modules"
};

export default function AuricruxDockPanel() {
  return <AuricruxDock context={context} />;
}
