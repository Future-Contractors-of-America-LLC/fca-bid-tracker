import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function AcademyPortal() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Academy"
      title="Academy continuity inside the portal keeps workforce enablement attached to customer and project outcomes."
      lead="This route should show that onboarding, training, and readiness are part of the same operational shell rather than a separate educational dead end."
      primaryCta={{ href: '/academy', label: 'Open Academy' }}
      secondaryCta={{ href: '/portal/projects', label: 'View Project Flow' }}
      cards={[
        {
          title: 'Readiness follow-through',
          detail: 'Training status should support production continuity and customer delivery rather than living outside the workflow.',
        },
        {
          title: 'Portal connection',
          detail: 'The portal should make it obvious how academy activity strengthens execution, compliance, and rollout confidence.',
        },
      ]}
    />
  );
}
