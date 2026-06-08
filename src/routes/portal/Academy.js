import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function AcademyPortal() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Academy"
      title="Portal Academy should show classroom readiness, curriculum progress, and live role-based enablement tied directly to project and customer outcomes."
      lead="Inside the workspace, Academy must feel operational. Teams should be able to see what learning path is assigned, what is complete, what is blocking adoption, and how Auricrux is using readiness signals to guide the next execution step."
      primaryCta={{ href: '/academy', label: 'Open Public Academy Story' }}
      secondaryCta={{ href: '/portal/projects', label: 'Return to Project Flow' }}
      proofPoints={[
        { value: 'Role paths', label: 'Estimator, PM, executive, and operations classroom visibility inside the portal.' },
        { value: 'Readiness state', label: 'Training should clearly show what is complete and what is blocking rollout.' },
        { value: 'Execution tie-in', label: 'Academy should directly support project quality, customer confidence, and platform adoption.' },
      ]}
      cards={[
        {
          title: 'Readiness follow-through',
          detail: 'Training status should change what the team does next in production, not live as isolated completion data.',
        },
        {
          title: 'Classroom visibility',
          detail: 'The portal should show which classroom or curriculum track belongs to which role and why that matters now.',
        },
        {
          title: 'Auricrux-guided enablement',
          detail: 'Auricrux should point the team toward the exact learning move that clears the operational bottleneck fastest.',
        },
      ]}
      sections={[
        {
          title: 'Minimum LMS operating surface',
          items: [
            'Assigned classroom list with progress and priority.',
            'Curriculum track detail connected to onboarding, adoption, or delivery risk.',
            'Role-by-role clarity on who still needs readiness work before execution can advance.'
          ],
        },
        {
          title: 'Why portal Academy matters',
          items: [
            'It proves FCA is not just selling software, but improving contractor capability.',
            'It makes adoption, onboarding, and rollout visible instead of hidden in meetings and email.',
            'It gives Auricrux a real place to connect intelligence with human readiness.'
          ],
        },
      ]}
    />
  );
}
