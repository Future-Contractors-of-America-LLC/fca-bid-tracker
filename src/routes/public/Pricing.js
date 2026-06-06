import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Pricing() {
  return (
    <RouteExperienceShell
      eyebrow="Plans & Rollout"
      title="FCA pricing should move a customer from curiosity into rollout planning, workspace entry, and guided adoption."
      lead="This route now behaves like a continuity-grade pricing surface instead of a demo placeholder, giving a clear path into contact, platform review, and workspace progression."
      primaryCta={{ href: '/contact', label: 'Open Contact & Rollout' }}
      secondaryCta={{ href: '/platform', label: 'Platform Overview' }}
      cards={[
        {
          title: 'Pilot workspace',
          detail: 'Best for guided setup, product walkthrough, and establishing customer continuity across portal and academy surfaces.',
        },
        {
          title: 'Growth rollout',
          detail: 'Expands customer coordination, files, communications, and training continuity inside the same FCA shell.',
        },
        {
          title: 'Enterprise posture',
          detail: 'Supports broader adoption of FCA as the unified contractor lifecycle operating system rather than a one-off bid tool.',
        },
      ]}
    />
  );
}
