import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Admin() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Admin"
      title="Admin should be the governance and rollout command surface for tenant setup, workspace control, readiness posture, and customer-operating continuity."
      lead="This route should show that FCA can support real operational governance. Users should understand where rollout stands, which team or customer setup tasks remain open, what access or configuration risk exists, and what Auricrux recommends to keep the system ready for real production use."
      primaryCta={{ href: '/platform', label: 'Open Platform Overview' }}
      secondaryCta={{ href: '/portal/notifications', label: 'View Operational Signals' }}
      proofPoints={[
        { value: 'Governance visible', label: 'Admin work should support rollout, access control, and operational confidence.' },
        { value: 'Readiness linked', label: 'Configuration, onboarding, and adoption state should stay connected to execution.' },
        { value: 'Not isolated', label: 'Admin should route back into projects, Academy, and communications without shell break.' },
      ]}
      cards={[
        {
          title: 'Governance posture',
          detail: 'Admin should support tenant, rollout, and workspace readiness instead of existing as an isolated control page disconnected from production work.',
        },
        {
          title: 'Operational continuity',
          detail: 'Users should be able to move from admin context back into projects, messaging, Academy, and portal activity with no loss of context.',
        },
        {
          title: 'Rollout control',
          detail: 'The system should show where user access, workspace setup, policy, or readiness work still blocks customer-wide operating confidence.',
        },
      ]}
      sections={[
        {
          title: 'Minimum admin operating surface',
          items: [
            'Tenant readiness status for onboarding, access, and core workspace activation.',
            'Role and route visibility showing whether the right people can access the right surfaces.',
            'Rollout checklist items that tie setup work directly to customer or project readiness.'
          ],
        },
        {
          title: 'Why this matters to the product',
          items: [
            'Enterprise buyers expect governance and rollout control, not just functional pages.',
            'Admin readiness helps prove FCA can support real customer deployment, not just product demos.',
            'Auricrux should be able to identify governance blockers before they become delivery problems.'
          ],
        },
      ]}
    />
  );
}
