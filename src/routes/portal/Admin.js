import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Admin() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Admin"
      title="Admin readiness now appears as part of the same operating shell that supports projects, communications, and rollout continuity."
      lead="This route should summarize governance, readiness, and workspace management without drifting away from the live customer journey."
      primaryCta={{ href: '/platform', label: 'Open Platform Dashboard' }}
      secondaryCta={{ href: '/portal/notifications', label: 'View Notifications' }}
      cards={[
        {
          title: 'Governance posture',
          detail: 'Admin work should support tenant, rollout, and workspace readiness instead of existing as an isolated control page.',
        },
        {
          title: 'Operational continuity',
          detail: 'Users should be able to move from admin context back into project, messaging, and portal activity without a shell break.',
        },
      ]}
    />
  );
}
