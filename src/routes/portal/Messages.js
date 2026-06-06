import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Messages() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Messages"
      title="Customer communication now stays inside the FCA portal shell instead of ending at a demo placeholder."
      lead="Messages should preserve project context, customer continuity, and Auricrux-guided next steps so the user always knows what should happen after a communication event."
      primaryCta={{ href: '/portal/projects', label: 'Open Projects' }}
      secondaryCta={{ href: '/portal/files', label: 'Review Files' }}
      cards={[
        {
          title: 'Project-linked communication',
          detail: 'Messages should remain attached to active projects, customer state, and approval movement rather than floating as isolated chat history.',
        },
        {
          title: 'Next-step continuity',
          detail: 'Auricrux should help route the user from communication into the next valid project, file, or academy action.',
        },
      ]}
    />
  );
}
