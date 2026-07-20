import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Auricrux() {
  return (
    <RouteExperienceShell
      eyebrow="Auricrux Operating Intelligence"
      title="Auricrux is the embedded construction intelligence layer that keeps FCA revenue motion, project execution, and workforce readiness coordinated around the next best action."
      lead="Auricrux should feel like real operating leverage. It should understand where the contractor is in the customer journey, what project or bid state matters most, what readiness gap is slowing execution, and which action should happen next across the platform and Academy."
      primaryCta={{ href: '/portal/projects', label: 'See Project Flow' }}
      secondaryCta={{ href: '/academy', label: 'See Training Alignment' }}
      proofPoints={[
        { value: 'Bid context', label: 'Auricrux should understand pipeline pressure, pricing state, and customer commitments.' },
        { value: 'Project context', label: 'Auricrux should connect approvals, files, communications, and handoff sequencing.' },
        { value: 'Readiness context', label: 'Auricrux should route users into the right Academy pathway when adoption is weak.' },
      ]}
      cards={[
        {
          title: 'Next-action clarity',
          detail: 'The user should know exactly what Auricrux wants them to do next, why that action matters, and which route will complete it.',
        },
        {
          title: 'Operating continuity',
          detail: 'Auricrux should hold continuity across website conversion, workspace activity, customer visibility, and workforce enablement.',
        },
        {
          title: 'Construction-specific intelligence',
          detail: 'The platform should feel built for contractor workflows, not for generic task management with AI paint on top.',
        },
      ]}
      sections={[
        {
          title: 'Real embedded behavior',
          items: [
            'Recommend the next project or bid action based on current workspace state.',
            'Show which customer-facing deliverable is blocked and what will clear it.',
            'Route the user into Academy when skill or rollout readiness is the real blocker.'
          ],
        },
        {
          title: 'What makes Auricrux credible',
          items: [
            'It should reduce founder load, not create another system to supervise.',
            'It should produce visible operating guidance on the public shell and inside authenticated routes.',
            'It should unify FCA into one construction platform experience.'
          ],
        },
      ]}
    />
  );
}
