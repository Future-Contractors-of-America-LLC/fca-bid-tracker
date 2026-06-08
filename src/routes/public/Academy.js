import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Academy() {
  return (
    <RouteExperienceShell
      eyebrow="FCA Academy"
      title="FCA Academy is the workforce intelligence layer for onboarding, classroom delivery, curriculum progression, and production readiness across the contractor lifecycle."
      lead="Academy should not feel like an afterthought. It should feel like a real LMS experience attached directly to execution: role-based classrooms, curriculum pathways, measurable readiness, and Auricrux guidance that pushes users toward the next meaningful skill or operating move."
      primaryCta={{ href: '/portal/academy', label: 'Open Academy Workspace' }}
      secondaryCta={{ href: '/contact', label: 'Request Rollout Plan' }}
      proofPoints={[
        { value: '4 roles', label: 'Estimator, project leader, executive, and operations learning paths.' },
        { value: 'Classroom ready', label: 'Tracks should support onboarding, adoption, and deployment confidence.' },
        { value: 'Execution tied', label: 'Training progress should influence next actions in the live workspace.' },
      ]}
      cards={[
        {
          title: 'Classroom structure',
          detail: 'Give contractors a clear way to enter a classroom, understand the curriculum, and see how learning ties to live work outcomes.',
        },
        {
          title: 'Curriculum progression',
          detail: 'Learning should move from fundamentals into workflow mastery, customer-facing delivery, and platform governance readiness.',
        },
        {
          title: 'Auricrux-guided readiness',
          detail: 'Auricrux should identify when a user, team, or customer needs specific training to unlock the next operational milestone.',
        },
      ]}
      sections={[
        {
          title: 'Minimum classroom set',
          items: [
            'Estimator launch classroom: pipeline hygiene, bid packaging, pricing visibility.',
            'Project delivery classroom: files, customer communications, approvals, and handoff control.',
            'Executive classroom: rollout governance, adoption accountability, and margin visibility.'
          ],
        },
        {
          title: 'Curriculum must support production',
          items: [
            'Each curriculum track should close a real operating gap, not just provide content.',
            'Portal Academy should reflect readiness against live project and customer conditions.',
            'The public Academy route should sell confidence and transformation, not just training access.'
          ],
        },
      ]}
    />
  );
}
