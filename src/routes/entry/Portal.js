import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Portal() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Workspace"
      title="Customer portal continuity starts here with project flow, files, messages, and academy follow-through inside one shell."
      lead="The portal entry surface should confirm that the customer has reached the operating workspace and provide immediate movement into the highest-value continuity surfaces."
      primaryCta={{ href: '/portal/projects', label: 'Open Projects' }}
      secondaryCta={{ href: '/portal/files', label: 'Review Files' }}
      cards={[
        {
          title: 'Project visibility',
          detail: 'Move directly into project-state surfaces instead of stopping at a generic dashboard placeholder.',
        },
        {
          title: 'Coordination continuity',
          detail: 'Messages, notifications, and files remain attached to the same workspace rather than separate tools.',
        },
        {
          title: 'Academy follow-through',
          detail: 'Training and readiness surfaces remain part of the same customer journey through the portal shell.',
        },
      ]}
    />
  );
}
