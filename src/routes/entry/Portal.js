import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Portal() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Workspace"
      title="The FCA workspace is the contractor command layer where projects, customer commitments, files, training readiness, and Auricrux-guided next actions converge."
      lead="This route should feel like a real SaaS landing surface after login. A customer or internal operator should immediately understand what work is active, where the project pressure lives, which route contains the needed information, and what Auricrux wants done next."
      primaryCta={{ href: '/portal/projects', label: 'Open Active Projects' }}
      secondaryCta={{ href: '/portal/messages', label: 'Review Customer Communications' }}
      proofPoints={[
        { value: 'Workspace-first', label: 'Authenticated users land in operational flow instead of a generic dashboard shell.' },
        { value: 'Connected modules', label: 'Projects, files, messages, finance, and Academy behave like one contractor system.' },
        { value: 'Auricrux-guided', label: 'Next actions should be visible immediately, not buried after navigation friction.' },
      ]}
      cards={[
        {
          title: 'Project visibility',
          detail: 'The workspace should surface active jobs, risk, missing deliverables, and customer-facing milestones from the first click after login.',
        },
        {
          title: 'Coordination continuity',
          detail: 'Messages, files, approvals, and readiness should preserve project context instead of forcing the team to rebuild it page by page.',
        },
        {
          title: 'Academy follow-through',
          detail: 'Training and rollout readiness should appear as part of execution health so adoption gaps are handled before they become delivery failures.',
        },
      ]}
      sections={[
        {
          title: 'What a customer-ready workspace must prove',
          items: [
            'Which projects or bids need attention right now.',
            'Which customer communication thread is blocking progress.',
            'Which file or approval is missing before the next deliverable can move.',
            'Which team or customer readiness gap needs Academy intervention.'
          ],
        },
        {
          title: 'How Auricrux should behave here',
          items: [
            'Recommend the highest-value next action on login.',
            'Explain why that action matters commercially or operationally.',
            'Route the user directly into projects, files, messages, or Academy without ambiguity.'
          ],
        },
      ]}
    />
  );
}
