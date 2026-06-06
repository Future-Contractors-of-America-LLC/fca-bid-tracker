import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Notifications() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Notifications"
      title="Notifications now act as a continuity surface for customer-visible changes, approvals, and operational alerts."
      lead="This route should help customers and operators understand what changed, why it matters, and where to go next inside the portal shell."
      primaryCta={{ href: '/portal/projects', label: 'Open Projects' }}
      secondaryCta={{ href: '/portal/messages', label: 'Open Messages' }}
      cards={[
        {
          title: 'Operational signal',
          detail: 'Alerts should summarize project, billing, file, and workflow changes without forcing the user to restart context.',
        },
        {
          title: 'Customer-visible movement',
          detail: 'Each notification should support believable movement into the next route rather than becoming a dead-end list item.',
        },
      ]}
    />
  );
}
