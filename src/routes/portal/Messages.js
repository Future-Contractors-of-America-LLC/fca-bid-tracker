import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Messages() {
  return (
    <RouteExperienceShell
      eyebrow="Portal Messages"
      title="Messages should function as project-linked operating communication, keeping customers, internal teams, and Auricrux next-step guidance inside one accountable thread."
      lead="This route should prove that communication is not a detached chat toy. It should be tied to project status, document gaps, approvals, customer expectations, and the next concrete action needed to keep delivery moving."
      primaryCta={{ href: '/portal/projects', label: 'Open Project Status' }}
      secondaryCta={{ href: '/portal/files', label: 'Review Linked Documents' }}
      proofPoints={[
        { value: 'Customer continuity', label: 'Every message should preserve project, account, and milestone context.' },
        { value: 'Decision support', label: 'Communication should reveal what needs a reply, approval, or escalation right now.' },
        { value: 'Auricrux guided', label: 'The system should translate communication events into the next valid project move.' },
      ]}
      cards={[
        {
          title: 'Project-linked communication',
          detail: 'Messages should remain attached to active jobs, bid movement, and customer commitments rather than floating as isolated conversation history.',
        },
        {
          title: 'Escalation clarity',
          detail: 'The user should be able to see whether the thread needs an approval, a file update, a customer answer, or internal execution follow-through.',
        },
        {
          title: 'Next-step continuity',
          detail: 'Auricrux should route the user from communication into the exact project, file, or Academy move required to keep momentum.',
        },
      ]}
      sections={[
        {
          title: 'Minimum customer-ready messaging flow',
          items: [
            'Conversation list tied to project and customer state.',
            'Thread-level visibility into blockers, approvals, and unanswered asks.',
            'Direct movement from a message into the project or file surface it references.'
          ],
        },
        {
          title: 'Why this matters competitively',
          items: [
            'Customers judge operational maturity by how clearly communication ties to work progress.',
            'A fragmented message surface makes the platform feel small and unreliable.',
            'A strong message flow makes FCA feel closer to a serious operating system category player.'
          ],
        },
      ]}
    />
  );
}
