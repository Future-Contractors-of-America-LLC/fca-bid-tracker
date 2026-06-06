import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Finance() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Finance"
      title="Finance continuity now lives inside the portal shell with billing, rollout, and customer follow-through kept in one path."
      lead="This route should help the user move through billing and financial visibility without losing the surrounding context of projects, messages, and next actions."
      primaryCta={{ href: '/pricing', label: 'Plans & Rollout' }}
      secondaryCta={{ href: '/portal/messages', label: 'Open Messages' }}
      cards={[
        {
          title: 'Billing continuity',
          detail: 'Financial movement should stay attached to the same workspace, not push the user into an unrelated side flow.',
        },
        {
          title: 'Customer confidence',
          detail: 'Clear finance routing helps reinforce that FCA is a real operating shell rather than a disconnected demo.',
        },
      ]}
    />
  );
}
