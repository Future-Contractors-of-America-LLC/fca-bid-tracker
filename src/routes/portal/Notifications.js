import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Notifications() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Notifications"
      title="Notifications should work as the operating signal layer for project updates, customer-visible changes, approvals, billing movement, and readiness alerts."
      lead="This route should tell the user what changed, why it matters, and which route contains the next required action. A serious contractor workspace needs signals that are prioritized, explainable, and connected to the work itself rather than a dead-end list of generic alerts."
      primaryCta={{ href: '/portal/projects', label: 'Open Active Projects' }}
      secondaryCta={{ href: '/portal/messages', label: 'Open Message Threads' }}
      proofPoints={[
        { value: 'Signal over noise', label: 'Alerts should prioritize real commercial, operational, and readiness pressure.' },
        { value: 'Route linked', label: 'Every notification should point clearly to the route that resolves it.' },
        { value: 'Auricrux aligned', label: 'Notifications should reinforce the next best action, not compete with it.' },
      ]}
      cards={[
        {
          title: 'Operational signal',
          detail: 'Alerts should summarize project, billing, file, approval, and readiness changes without forcing the user to reconstruct context from scratch.',
        },
        {
          title: 'Customer-visible movement',
          detail: 'Each notification should support believable movement into the next route instead of becoming a passive status message that goes nowhere.',
        },
        {
          title: 'Priority discipline',
          detail: 'The workspace should distinguish between something informative, something urgent, and something blocking revenue or delivery.',
        },
      ]}
      sections={[
        {
          title: 'Minimum notification operating surface',
          items: [
            'Signals for project changes, unanswered customer asks, file approvals, billing movement, and rollout readiness.',
            'Severity or importance context so users know what to act on first.',
            'Clear route handoff into the project, file, finance, Academy, or message surface that resolves the alert.'
          ],
        },
        {
          title: 'How Auricrux should use notifications',
          items: [
            'Translate raw alerts into next-action guidance.',
            'Combine multiple weak signals into one meaningful operating recommendation.',
            'Reduce founder and operator overload by making the alert layer decision-ready.'
          ],
        },
      ]}
    />
  );
}
