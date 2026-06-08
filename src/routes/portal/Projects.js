import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Projects() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Projects"
      title="Projects are the operating spine of the workspace, connecting delivery status, documents, communication threads, and Auricrux-guided next actions in one contractor view."
      lead="This route should feel like the beginning of a real SaaS workflow: what jobs are active, where execution is blocked, what the customer is waiting on, and which action will move the project forward with the least friction."
      primaryCta={{ href: '/portal/files', label: 'Review Files' }}
      secondaryCta={{ href: '/portal/academy', label: 'Check Team Readiness' }}
      proofPoints={[
        { value: 'Project view', label: 'Single route for status, milestone pressure, and customer-visible work state.' },
        { value: 'Auricrux action', label: 'Recommended next move should be visible directly in the workflow.' },
        { value: 'Readiness link', label: 'Training and rollout gaps should be attached to the project, not hidden elsewhere.' },
      ]}
      cards={[
        {
          title: 'Execution spine',
          detail: 'Projects should anchor bids won, kickoff progress, delivery confidence, change visibility, and customer follow-through.',
        },
        {
          title: 'Customer clarity',
          detail: 'The customer should be able to understand where work stands and what is needed next without chasing disconnected updates.',
        },
        {
          title: 'Operating escalation',
          detail: 'If approvals, files, or readiness are blocking progress, the workspace should surface that pressure immediately.',
        },
      ]}
      sections={[
        {
          title: 'Minimum customer-ready project flow',
          items: [
            'Active projects list with health, owner, and next milestone.',
            'Per-project next action driven by Auricrux and recent workflow state.',
            'Direct path into files, messages, and training readiness for the team involved.'
          ],
        },
        {
          title: 'Why this matters commercially',
          items: [
            'A contractor buying FCA should immediately feel that this is more than a brochure site.',
            'Projects are where customers decide whether the product can run real work.',
            'This route is the strongest bridge between public credibility and operational trust.'
          ],
        },
      ]}
    />
  );
}
