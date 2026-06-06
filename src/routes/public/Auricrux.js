import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Auricrux() {
  return (
    <RouteExperienceShell
      eyebrow="Auricrux Operating Layer"
      title="Auricrux is the visible execution layer that keeps FCA routes, next actions, and customer continuity aligned."
      lead="This surface should explain how Auricrux guides movement between platform overview, workspace entry, portal coordination, and academy follow-through without leaving the customer inside disconnected route fragments."
      primaryCta={{ href: '/platform', label: 'Open Platform Dashboard' }}
      secondaryCta={{ href: '/portal', label: 'Open Portal Workspace' }}
      cards={[
        {
          title: 'Next-action clarity',
          detail: 'Auricrux should make the next valid step visible across bids, projects, files, messages, and rollout tasks.',
        },
        {
          title: 'Continuity enforcement',
          detail: 'Public routes, workspace entry, portal movement, and academy continuity should remain part of one guided shell.',
        },
        {
          title: 'Founder-load reduction',
          detail: 'A visible operating layer reduces re-briefing and keeps the product moving toward true founder hands-off posture.',
        },
      ]}
    />
  );
}
