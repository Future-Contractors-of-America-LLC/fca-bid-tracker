import React from 'react';

const shellStyles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: 'linear-gradient(180deg, #081120 0%, #0f172a 45%, #111827 100%)',
    color: '#e5eefb',
    padding: '3rem 1.5rem 4rem',
  },
  wrap: {
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'grid',
    gap: '1.5rem',
  },
  eyebrow: {
    color: '#7dd3fc',
    fontSize: '0.82rem',
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
    lineHeight: 1.05,
  },
  lead: {
    maxWidth: '780px',
    margin: '1rem 0 0',
    fontSize: '1.05rem',
    lineHeight: 1.7,
    color: '#cbd5e1',
  },
  ctas: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  primary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.9rem 1.2rem',
    borderRadius: '999px',
    textDecoration: 'none',
    background: '#4f7cff',
    color: '#ffffff',
    fontWeight: 700,
  },
  secondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.9rem 1.2rem',
    borderRadius: '999px',
    textDecoration: 'none',
    background: 'rgba(148, 163, 184, 0.12)',
    color: '#e5eefb',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    fontWeight: 700,
  },
  proofGrid: {
    display: 'grid',
    gap: '0.9rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    marginTop: '1.25rem',
  },
  proofCard: {
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(79, 124, 255, 0.2)',
    borderRadius: '1rem',
    padding: '1rem',
  },
  proofValue: {
    display: 'block',
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#f8fafc',
  },
  proofLabel: {
    display: 'block',
    marginTop: '0.4rem',
    fontSize: '0.86rem',
    color: '#cbd5e1',
    lineHeight: 1.5,
  },
  grid: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    marginTop: '1rem',
  },
  card: {
    background: 'rgba(15, 23, 42, 0.75)',
    border: '1px solid rgba(125, 211, 252, 0.14)',
    borderRadius: '1rem',
    padding: '1.1rem',
    boxShadow: '0 10px 30px rgba(2, 6, 23, 0.25)',
  },
  cardTitle: {
    margin: '0 0 0.45rem',
    fontSize: '1rem',
    color: '#f8fafc',
  },
  cardBody: {
    margin: 0,
    color: '#cbd5e1',
    lineHeight: 1.6,
    fontSize: '0.96rem',
  },
  sectionGrid: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  },
  section: {
    background: 'rgba(2, 6, 23, 0.36)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    borderRadius: '1rem',
    padding: '1.2rem',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.02rem',
    color: '#f8fafc',
  },
  sectionLead: {
    margin: '0.65rem 0 0',
    color: '#cbd5e1',
    lineHeight: 1.65,
    fontSize: '0.95rem',
  },
  list: {
    margin: '0.9rem 0 0',
    paddingLeft: '1.1rem',
    color: '#dbe7f5',
    lineHeight: 1.7,
  },
  listItem: {
    marginBottom: '0.45rem',
  },
};

export default function RouteExperienceShell({
  eyebrow,
  title,
  lead,
  primaryCta,
  secondaryCta,
  proofPoints = [],
  cards = [],
  sections = [],
}) {
  return (
    <section style={shellStyles.page}>
      <div style={shellStyles.wrap}>
        <header>
          <div style={shellStyles.eyebrow}>{eyebrow}</div>
          <h1 style={shellStyles.title}>{title}</h1>
          <p style={shellStyles.lead}>{lead}</p>
          <div style={shellStyles.ctas}>
            {primaryCta ? (
              <a href={primaryCta.href} style={shellStyles.primary}>
                {primaryCta.label}
              </a>
            ) : null}
            {secondaryCta ? (
              <a href={secondaryCta.href} style={shellStyles.secondary}>
                {secondaryCta.label}
              </a>
            ) : null}
          </div>
          {proofPoints.length ? (
            <div style={shellStyles.proofGrid}>
              {proofPoints.map((point) => (
                <article key={`${point.value}-${point.label}`} style={shellStyles.proofCard}>
                  <span style={shellStyles.proofValue}>{point.value}</span>
                  <span style={shellStyles.proofLabel}>{point.label}</span>
                </article>
              ))}
            </div>
          ) : null}
        </header>
        {cards.length ? (
          <div style={shellStyles.grid}>
            {cards.map((card) => (
              <article key={card.title} style={shellStyles.card}>
                <h2 style={shellStyles.cardTitle}>{card.title}</h2>
                <p style={shellStyles.cardBody}>{card.detail}</p>
              </article>
            ))}
          </div>
        ) : null}
        {sections.length ? (
          <div style={shellStyles.sectionGrid}>
            {sections.map((section) => (
              <section key={section.title} style={shellStyles.section}>
                <h2 style={shellStyles.sectionTitle}>{section.title}</h2>
                {section.lead ? <p style={shellStyles.sectionLead}>{section.lead}</p> : null}
                {section.items?.length ? (
                  <ul style={shellStyles.list}>
                    {section.items.map((item) => (
                      <li key={item} style={shellStyles.listItem}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
