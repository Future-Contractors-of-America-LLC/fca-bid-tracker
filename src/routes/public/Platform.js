import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Platform() {
  return (
    <RouteExperienceShell
      eyebrow="Platform Overview"
      title="The FCA platform is being built as one operating system for estimating, project delivery, customer visibility, workforce enablement, and Auricrux-guided execution."
      lead="This surface should read like a real product architecture page: how the website converts demand, how the workspace runs contractor operations, how the Academy accelerates rollout, and how Auricrux keeps every surface coordinated around production outcomes."
      primaryCta={{ href: '/portal', label: 'Open Operational Workspace' }}
      secondaryCta={{ href: '/academy', label: 'View Academy Pathways' }}
      proofPoints={[
        { value: 'SaaS', label: 'Bid, project, file, message, finance, and admin pathways that belong to one operating model.' },
        { value: 'LMS', label: 'Role-based classrooms and curriculum tied to adoption, compliance, and execution readiness.' },
        { value: 'AI layer', label: 'Auricrux embedded as the operating intelligence rather than a decorative assistant.' },
      ]}
      cards={[
        {
          title: 'Commercial pipeline to workspace',
          detail: 'The public shell should convert traffic into demo motion, workspace entry, and customer confidence instead of dropping users into dead-end marketing routes.',
        },
        {
          title: 'Operational modules',
          detail: 'Projects, files, finance, notifications, and messages should behave like connected execution modules instead of isolated pages.',
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
            'Workspace dashboard that surfaces bid pressure, active project health, and customer commitments.',
            'Project flow that connects messages, files, approvals, and delivery milestones.',
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
