import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Platform() {
  return (
    <RouteExperienceShell
      eyebrow="Platform Overview"
      title="FCA Contractor Command is being built as the contractor operating spine for intake, qualification, files, bids, customer visibility, and Auricrux-guided execution."
      lead="This surface should read like a real product architecture page: how the website converts demand into qualified opportunities, how the workspace organizes evidence and bid action, how the customer portal reinforces trust, and how the Academy accelerates rollout around production outcomes."
      primaryCta={{ href: '/portal', label: 'Open Operational Workspace' }}
      secondaryCta={{ href: '/academy', label: 'View Academy Pathways' }}
      proofPoints={[
        { value: 'Opportunity spine', label: 'Lead intake, qualification, file handling, bid workflow, and customer portal continuity in one operating model.' },
        { value: 'LMS', label: 'Role-based classrooms and curriculum tied to adoption, compliance, and execution readiness.' },
        { value: 'AI layer', label: 'Auricrux embedded as the operating intelligence rather than a decorative assistant.' },
      ]}
      cards={[
        {
          title: 'Commercial pipeline to workspace',
          detail: 'The public shell should convert traffic into qualified opportunity motion, workspace entry, and customer confidence instead of dropping users into dead-end marketing routes.',
        },
        {
          title: 'Operational modules',
          detail: 'Qualification, files, bids, messages, customer updates, and approvals should behave like connected execution modules instead of isolated pages.',
        },
        {
          title: 'Readiness and rollout',
          detail: 'Academy should make platform adoption durable by teaching the right role the right workflow at the right moment.',
        },
      ]}
      sections={[
        {
          title: 'SaaS pathways that need to feel real',
          items: [
            'Lead and opportunity intake that surfaces budget, jurisdiction, evidence, and qualification pressure.',
            'Bid flow that connects files, messages, approvals, customer commitments, and delivery milestones.',
            'Auricrux next actions that convert static pages into guided operating decisions.'
          ],
        },
        {
          title: 'Academy pathways that need to feel real',
          items: [
            'Classroom catalog for estimators, PMs, executives, and operations users.',
            'Curriculum tracks that mirror real contractor outcomes, not generic LMS filler.',
            'Readiness states that show which team or customer needs training before execution can advance.'
          ],
        },
      ]}
    />
  );
}
