import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Contact() {
  return (
    <RouteExperienceShell
      eyebrow="Contact & Rollout"
      title="Schedule a walkthrough, pilot discussion, or rollout review."
      lead="Talk with FCA about fit, rollout scope, and the next step for your team."
      primaryCta={{ href: '/contact', label: 'Contact FCA' }}
      secondaryCta={{ href: '/login', label: 'Sign in to workspace' }}
      cards={[
        {
          title: 'Walkthrough',
          detail: 'See how bids, projects, billing, and Academy connect in Contractor Command.',
        },
        {
          title: 'Pilot discussion',
          detail: 'Frame rollout scope, team size, and immediate operational value.',
        },
        {
          title: 'Rollout review',
          detail: 'Match pricing tier to your team and confirm the activation path.',
        },
      ]}
    />
  );
}
