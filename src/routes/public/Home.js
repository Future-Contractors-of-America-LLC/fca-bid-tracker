import React from 'react';
import RouteExperienceShell from '../../components/RouteExperienceShell';

export default function Home() {
  return (
    <RouteExperienceShell
      eyebrow="FCA Construction Operating System"
      title="Win more work, coordinate delivery, and train your workforce inside one contractor platform with Auricrux embedded from first touch to field execution."
      lead="Future Contractors of America is being shaped as a unified operating system for commercial contractors: customer-ready website motion, real SaaS pathways for bids and projects, Academy classrooms that improve production readiness, and Auricrux guidance that turns scattered activity into next-action clarity."
      primaryCta={{ href: '/login', label: 'Open FCA Workspace' }}
      secondaryCta={{ href: '/platform', label: 'Explore Platform Modules' }}
      proofPoints={[
        { value: '1 platform', label: 'Public site, SaaS workspace, Academy, and Auricrux operating in one shell.' },
        { value: '3 buyer paths', label: 'Request demo, launch workspace, or enter Academy without losing context.' },
        { value: 'Real next actions', label: 'Auricrux keeps bids, projects, and training aligned to production outcomes.' },
      ]}
      cards={[
        {
          title: 'Revenue path',
          detail: 'Move from market-facing credibility into authenticated workspace motion that looks like a real contractor product, not a disconnected demo shell.',
        },
        {
          title: 'Operational path',
          detail: 'Give estimators, PMs, owners, and customers a live route into project visibility, files, messages, and execution continuity.',
        },
        {
          title: 'Readiness path',
          detail: 'Connect Academy classrooms and curriculum to live adoption, onboarding, and role-based field readiness instead of leaving training outside delivery.',
        },
      ]}
      sections={[
        {
          title: 'Compete like an enterprise platform',
          lead: 'The website has to feel credible next to Autodesk, Intuit, and Procore. That means a stronger platform story, stronger navigation, and stronger proof of operational depth.',
          items: [
            'Position FCA as a unified construction operating system instead of a single-purpose bid tool.',
            'Show how workspace, Academy, and Auricrux reinforce each other instead of behaving like separate products.',
            'Turn every public CTA into a route toward real product interaction.'
          ],
        },
        {
          title: 'Build real contractor journeys',
          lead: 'Customer-ready product means a contractor can enter, understand the value, log in, and immediately move into useful work with guided continuity.',
          items: [
            'Bid and project workspaces must show current state, next action, and decision pressure.',
            'Auricrux must help the user see what to do next and why it matters.',
            'Academy must close capability gaps when adoption or execution readiness is weak.'
          ],
        },
      ]}
    />
  );
}
