import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Home() {
  return (
    <RouteExperienceShell
      eyebrow="FCA Contractor Command"
      title="Qualify more contractor opportunities, organize bid evidence, and give customers a live portal inside one Auricrux-guided operating workspace."
      lead="Future Contractors of America is being shaped around a sellable flagship product spine: lead and opportunity intake, qualification, file and evidence handling, bid and estimate workflow, customer portal continuity, and Auricrux guidance that turns scattered activity into next-action clarity."
      primaryCta={{ href: '/login', label: 'Open FCA Workspace' }}
      secondaryCta={{ href: '/platform', label: 'Explore Platform Modules' }}
      proofPoints={[
        { value: '1 flagship', label: 'Contractor Command ties intake, qualification, files, bids, and customer visibility into one product story.' },
        { value: '3 buyer paths', label: 'Request demo, launch workspace, or enter Academy without losing context.' },
        { value: 'Real next actions', label: 'Auricrux keeps opportunity pressure, delivery continuity, and training readiness aligned.' },
      ]}
      cards={[
        {
          title: 'Revenue path',
          detail: 'Move from market-facing credibility into authenticated opportunity and bid motion that looks like a real contractor product, not a disconnected demo shell.',
        },
        {
          title: 'Operational path',
          detail: 'Give estimators, PMs, owners, and customers a live route into qualification status, files, messages, project continuity, and execution visibility.',
        },
        {
          title: 'Readiness path',
          detail: 'Connect Academy classrooms and curriculum to live adoption, onboarding, and role-based field readiness instead of leaving training outside delivery.',
        },
      ]}
      sections={[
        {
          title: 'Sell a real contractor product',
          lead: 'The website has to sell a clear first product before the broader ecosystem can expand. That means sharper buyer language, sharper workflow narrative, and sharper proof of utility.',
          items: [
            'Lead with Contractor Command as the intake, qualification, bid, and customer-portal workspace.',
            'Show how workspace, Academy, and Auricrux reinforce one another instead of behaving like separate products.',
            'Turn every public CTA into a route toward real product interaction.'
          ],
        },
        {
          title: 'Build real contractor journeys',
          lead: 'Customer-ready product means a contractor can enter, understand the value, log in, and immediately move into useful work with guided continuity.',
          items: [
            'Opportunity and bid workspaces must show current state, next action, and decision pressure.',
            'File and evidence handling must help the team qualify work, defend decisions, and present a trustworthy client-facing posture.',
            'Academy must close capability gaps when adoption or execution readiness is weak.'
          ],
        },
      ]}
    />
  );
}
