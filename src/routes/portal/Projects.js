import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Projects() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Projects"
      title="Project flow visibility now sits inside the portal shell with clear movement into files, messages, and execution continuity."
      lead="Projects should be the operational spine for the workspace, showing customers and internal users where work stands and what the next valid action is."
      primaryCta={{ href: '/portal/files', label: 'Review Files' }}
      secondaryCta={{ href: '/portal/messages', label: 'Open Messages' }}
      cards={[
        {
          title: 'Execution spine',
          detail: 'Projects should anchor files, communications, approvals, and schedule continuity instead of leaving each surface disconnected.',
        },
        {
          title: 'Customer clarity',
          detail: 'The customer should be able to move from project state into documentation and communication with no loss of context.',
        },
      ]}
    />
  );
}
