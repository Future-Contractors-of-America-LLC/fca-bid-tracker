import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Finance() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Finance"
      title="Finance should function as live commercial visibility for billing, contract confidence, cash timing, and rollout readiness inside the same contractor workspace."
      lead="This route should feel like a real operating surface, not a side page. Users should understand what revenue is active, which invoice or payment milestone is waiting, what commercial risk is exposed, and what Auricrux recommends to protect delivery confidence and customer trust."
      primaryCta={{ href: '/pricing', label: 'Review Plans & Rollout' }}
      secondaryCta={{ href: '/portal/projects', label: 'Return to Project Flow' }}
      proofPoints={[
        { value: 'Commercial clarity', label: 'Billing, contract state, and payment movement stay attached to active delivery work.' },
        { value: 'Customer confidence', label: 'Finance visibility strengthens trust by making commercial commitments easier to understand.' },
        { value: 'Auricrux aware', label: 'The platform should surface the next commercial action when finance is the blocker.' },
      ]}
      cards={[
        {
          title: 'Billing continuity',
          detail: 'Financial movement should stay inside the same workspace so the user can move from invoice state into project delivery, files, and communication without a context break.',
        },
        {
          title: 'Revenue protection',
          detail: 'The finance surface should show where payment, change, or contract friction could slow execution, margin confidence, or customer rollout.',
        },
        {
          title: 'Commercial follow-through',
          detail: 'Users should be able to see which commercial obligation is complete, pending, blocked, or waiting for customer action right now.',
        },
      ]}
      sections={[
        {
          title: 'Minimum finance operating surface',
          items: [
            'Invoice and payment milestone visibility tied to the active project or customer account.',
            'Contract, change, and billing state that shows what is approved, pending, or commercially exposed.',
            'Direct movement from a finance issue into the project, message, or file route that will resolve it.'
          ],
        },
        {
          title: 'How Auricrux should help here',
          items: [
            'Identify when commercial friction is becoming an execution risk.',
            'Recommend the next action needed to protect payment confidence or customer trust.',
            'Route the user to the exact project or communication surface that clears the issue fastest.'
          ],
        },
      ]}
    />
  );
}
