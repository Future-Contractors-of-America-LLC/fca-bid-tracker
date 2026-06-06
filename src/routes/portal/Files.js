import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Files() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Files"
      title="Files now function as a continuity surface for customer documentation, delivery records, and project coordination."
      lead="This route should preserve project-linked file visibility so users can review documents and continue into messaging, finance, or project follow-through without a context break."
      primaryCta={{ href: '/portal/projects', label: 'Open Projects' }}
      secondaryCta={{ href: '/portal/messages', label: 'Open Messages' }}
      cards={[
        {
          title: 'Document continuity',
          detail: 'Files should remain attached to the live project path rather than feeling like a detached storage page.',
        },
        {
          title: 'Cross-surface follow-through',
          detail: 'After reviewing documentation, the user should have a clear route into questions, approvals, and project execution flow.',
        },
      ]}
    />
  );
}
