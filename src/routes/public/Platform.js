import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Platform() {
  return (
    <RouteExperienceShell
      eyebrow="Platform Overview"
      title="The FCA platform connects public shell, workspace entry, customer portal, and academy continuity in one route system."
      lead="This surface should explain how contractors move from conversion into execution, with Auricrux maintaining next-action clarity across projects, files, communications, and rollout readiness."
      primaryCta={{ href: '/login', label: 'Continue to Workspace Login' }}
      secondaryCta={{ href: '/portal', label: 'Open Portal Workspace' }}
      cards={[
        {
          title: 'Workspace entry',
          detail: 'Customers move from public shell into authenticated workspace continuity instead of stopping at a marketing dead end.',
        },
        {
          title: 'Operational visibility',
          detail: 'Portal, support, academy, and admin surfaces should remain visibly tied to the same customer journey.',
        },
        {
          title: 'Auricrux guidance',
          detail: 'The embedded operating layer should keep route progression and next steps understandable at every stage.',
        },
      ]}
    />
  );
}
