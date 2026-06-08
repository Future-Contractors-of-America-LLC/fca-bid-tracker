import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Files() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Files"
      title="Files should operate like a live project record, giving teams and customers immediate access to the documents, packages, approvals, and evidence needed to move work forward."
      lead="This route should feel like a real document-control surface inside the contractor workflow. Users should be able to understand what file package is current, what is missing, what is waiting for review, and what conversation or next action depends on the document state."
      primaryCta={{ href: '/portal/projects', label: 'Return to Project Flow' }}
      secondaryCta={{ href: '/portal/messages', label: 'Open Message Threads' }}
      proofPoints={[
        { value: 'Document control', label: 'Files should support submittals, contracts, drawings, and customer-ready recordkeeping.' },
        { value: 'Approval aware', label: 'The workspace should surface which package is approved, pending, or blocking execution.' },
        { value: 'Auricrux linked', label: 'The next file action should be explicit when document state is the bottleneck.' },
      ]}
      cards={[
        {
          title: 'Project-linked packages',
          detail: 'Every file set should stay attached to a project, milestone, customer, and operating need instead of acting like generic storage.',
        },
        {
          title: 'Cross-surface follow-through',
          detail: 'After reviewing documentation, the user should move directly into approvals, customer messages, or project action without losing context.',
        },
        {
          title: 'Execution evidence',
          detail: 'The document surface should strengthen customer confidence by making delivery records and readiness evidence easy to find and understand.',
        },
      ]}
      sections={[
        {
          title: 'Minimum customer-ready file workflow',
          items: [
            'Active package list: contract, scope, drawing, change, invoice, or handoff record.',
            'Status by package: ready, pending review, approved, blocked, or missing.',
            'Visible path from file state into customer communication and project next action.'
          ],
        },
        {
          title: 'Where Auricrux adds value',
          items: [
            'Identify the document missing before the team can proceed.',
            'Show which customer-visible deliverable is waiting on file completion.',
            'Route the user into the exact follow-up thread or project step that clears the bottleneck.'
          ],
        },
      ]}
    />
  );
}
