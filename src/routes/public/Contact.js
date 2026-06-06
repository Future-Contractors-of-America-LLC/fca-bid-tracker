import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Contact() {
  return (
    <RouteExperienceShell
      eyebrow="Contact & Rollout"
      title="Start a walkthrough, pilot discussion, or rollout review without breaking continuity from the FCA public shell."
      lead="This route should provide a clear founder-demo and customer-ready path into the next real conversation, instead of ending in a dead placeholder."
      primaryCta={{ href: '/platform', label: 'Platform Overview' }}
      secondaryCta={{ href: '/login', label: 'Open FCA Workspace' }}
      cards={[
        {
          title: 'Walkthrough path',
          detail: 'Guide prospects into the live shell narrative so they can see public routes, workspace entry, and portal continuity in sequence.',
        },
        {
          title: 'Pilot discussion',
          detail: 'Frame the conversation around rollout scope, customer fit, and immediate operational value.',
        },
        {
          title: 'Rollout review',
          detail: 'Keep pricing, platform, and contact paths tied together so the customer always has a visible next step.',
        },
      ]}
    />
  );
}
