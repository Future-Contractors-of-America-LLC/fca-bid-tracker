import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Home() {
  return (
    <RouteExperienceShell
      eyebrow="FCA Public Shell"
      title="Future Contractors of America keeps bid flow, customer visibility, and workforce readiness inside one operating system."
      lead="Move from first interest into workspace login, project continuity, and Auricrux-guided next actions without breaking the customer journey into disconnected tools."
      primaryCta={{ href: '/login', label: 'Open FCA Workspace' }}
      secondaryCta={{ href: '/platform', label: 'Platform Overview' }}
      cards={[
        {
          title: 'Bid continuity',
          detail: 'Guide estimating, approvals, and customer follow-through from one shell instead of scattered handoffs.',
        },
        {
          title: 'Portal visibility',
          detail: 'Give customers a clear path into files, messages, and project-state visibility.',
        },
        {
          title: 'Academy alignment',
          detail: 'Keep workforce enablement connected to production continuity rather than outside the platform.',
        },
      ]}
    />
  );
}
