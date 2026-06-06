import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Academy() {
  return (
    <RouteExperienceShell
      eyebrow="Academy Continuity"
      title="FCA Academy keeps workforce readiness, onboarding, and training continuity attached to the same operating shell as production work."
      lead="This route should prove that academy activity is not separate from the platform, but part of the same customer and contractor lifecycle guided by Auricrux."
      primaryCta={{ href: '/portal', label: 'Open Portal Workspace' }}
      secondaryCta={{ href: '/contact', label: 'Open Contact & Rollout' }}
      cards={[
        {
          title: 'Workforce readiness',
          detail: 'Training pathways should remain visibly connected to live project and customer continuity rather than isolated LMS pages.',
        },
        {
          title: 'Onboarding follow-through',
          detail: 'Academy continuity should support rollout, adoption, and production readiness inside the same shell journey.',
        },
        {
          title: 'Auricrux guidance',
          detail: 'The embedded operating layer should make it obvious how academy work supports the next production action.',
        },
      ]}
    />
  );
}
