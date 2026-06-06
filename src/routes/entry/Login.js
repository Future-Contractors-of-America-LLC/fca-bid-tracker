import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Login() {
  return (
    <RouteExperienceShell
      eyebrow="Workspace Entry"
      title="Enter the FCA workspace and continue into project visibility, customer coordination, and rollout follow-through."
      lead="This login surface should act as the bridge from the public shell into the live customer workspace, not as a dead-end placeholder. It now provides the intended continuity direction even before full authentication logic is wired in."
      primaryCta={{ href: '/portal', label: 'Open Portal Workspace' }}
      secondaryCta={{ href: '/academy', label: 'Open Academy' }}
      cards={[
        {
          title: 'Customer continuity',
          detail: 'Login should preserve the context built on public routes and carry the user into the portal without route drift.',
        },
        {
          title: 'Production handoff',
          detail: 'Authenticated users should continue into projects, files, messages, and billing without re-explaining the system.',
        },
      ]}
    />
  );
}
