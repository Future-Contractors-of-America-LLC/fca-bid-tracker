import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalJourney, projectAuditEvents, routeStateOverlays } from '../../systemState';
import {
  readActiveProjectId,
  readProjectWorkspace,
  writeActiveProjectId,
} from '../../projectWorkspaceStore';

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: 'linear-gradient(180deg, #081120 0%, #0f172a 45%, #111827 100%)',
    color: '#e5eefb',
    padding: '3rem 1.5rem 4rem',
  },
  wrap: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gap: '1.25rem',
  },
  hero: {
    display: 'grid',
    gap: '1rem',
    padding: '1.5rem',
    borderRadius: '1.25rem',
    border: '1px solid rgba(79, 124, 255, 0.22)',
    background: 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(15,23,42,0.72))',
    boxShadow: '0 24px 70px rgba(2, 6, 23, 0.35)',
  },
  eyebrow: {
    color: '#7dd3fc',
    fontSize: '0.82rem',
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
    lineHeight: 1.04,
  },
  lead: {
    margin: 0,
    maxWidth: '860px',
    color: '#cbd5e1',
    lineHeight: 1.7,
    fontSize: '1rem',
  },
  metricGrid: {
    display: 'grid',
    gap: '0.85rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  },
  metricCard: {
    borderRadius: '1rem',
    padding: '1rem',
    background: 'rgba(15, 23, 42, 0.72)',
    border: '1px solid rgba(125, 211, 252, 0.12)',
  },
  metricValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#f8fafc',
  },
  metricLabel: {
    display: 'block',
    marginTop: '0.35rem',
    color: '#cbd5e1',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  layout: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'minmax(320px, 0.95fr) minmax(0, 1.55fr)',
    alignItems: 'start',
  },
  panel: {
    borderRadius: '1.1rem',
    padding: '1.2rem',
    background: 'rgba(15, 23, 42, 0.78)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
  },
  panelTitle: {
    margin: 0,
    fontSize: '1.05rem',
    color: '#f8fafc',
  },
  panelLead: {
    margin: '0.65rem 0 0',
    color: '#cbd5e1',
    lineHeight: 1.65,
    fontSize: '0.95rem',
  },
  projectList: {
    display: 'grid',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  projectCard: (active) => ({
    borderRadius: '1rem',
    padding: '1rem',
    border: active ? '1px solid rgba(79, 124, 255, 0.65)' : '1px solid rgba(148, 163, 184, 0.16)',
    background: active ? 'rgba(37, 99, 235, 0.12)' : 'rgba(2, 6, 23, 0.3)',
    cursor: 'pointer',
  }),
  projectName: {
    margin: 0,
    fontSize: '1rem',
    color: '#f8fafc',
  },
  projectMeta: {
    margin: '0.4rem 0 0',
    color: '#cbd5e1',
    fontSize: '0.92rem',
    lineHeight: 1.55,
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  pill: (tone = 'neutral') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 700,
    background:
      tone === 'blocked'
        ? 'rgba(239, 68, 68, 0.12)'
        : tone === 'active'
        ? 'rgba(34, 197, 94, 0.12)'
        : tone === 'watch'
        ? 'rgba(245, 158, 11, 0.12)'
        : 'rgba(148, 163, 184, 0.12)',
    color:
      tone === 'blocked' ? '#fca5a5' : tone === 'active' ? '#86efac' : tone === 'watch' ? '#fcd34d' : '#cbd5e1',
    border: '1px solid rgba(148, 163, 184, 0.16)',
  }),
  detailGrid: {
    display: 'grid',
    gap: '0.9rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    marginTop: '1rem',
  },
  detailCard: {
    borderRadius: '1rem',
    padding: '1rem',
    background: 'rgba(2, 6, 23, 0.36)',
    border: '1px solid rgba(148, 163, 184, 0.14)',
  },
  detailLabel: {
    display: 'block',
    fontSize: '0.76rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#7dd3fc',
    fontWeight: 700,
  },
  detailValue: {
    display: 'block',
    marginTop: '0.45rem',
    color: '#f8fafc',
    lineHeight: 1.55,
    fontSize: '0.95rem',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  primary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.9rem 1.15rem',
    borderRadius: '999px',
    background: '#4f7cff',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 700,
  },
  secondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.9rem 1.15rem',
    borderRadius: '999px',
    background: 'rgba(148, 163, 184, 0.12)',
    color: '#e5eefb',
    textDecoration: 'none',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    fontWeight: 700,
  },
  auditList: {
    display: 'grid',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  auditItem: {
    borderRadius: '0.95rem',
    padding: '0.95rem',
    background: 'rgba(2, 6, 23, 0.34)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
  },
  auditTime: {
    color: '#7dd3fc',
    fontSize: '0.82rem',
    fontWeight: 700,
  },
  auditText: {
    margin: '0.4rem 0 0',
    color: '#e5eefb',
    lineHeight: 1.65,
    fontSize: '0.94rem',
  },
  journey: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.55rem',
    marginTop: '0.9rem',
  },
  journeyLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 0.75rem',
    borderRadius: '999px',
    textDecoration: 'none',
    color: '#dbe7f5',
    background: 'rgba(148, 163, 184, 0.09)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    fontSize: '0.84rem',
    fontWeight: 700,
  },
};

function healthTone(project) {
  if (project.health) return project.health;
  if ((project.blocker || '').toLowerCase().includes('pending')) return 'blocked';
  if ((project.stage || '').toLowerCase().includes('closeout')) return 'watch';
  return 'active';
}

function summarizeMetrics(projects, activeProject) {
  const blockedCount = projects.filter((project) => healthTone(project) === 'blocked').length;
  const activeCount = projects.filter((project) => healthTone(project) === 'active').length;

  return [
    {
      value: String(projects.length),
      label: 'Projects connected to the current workspace spine.',
    },
    {
      value: String(blockedCount),
      label: 'Projects with a visible blocker that Auricrux should help clear next.',
    },
    {
      value: String(activeCount),
      label: 'Projects already positioned for active delivery or mobilization flow.',
    },
    {
      value: activeProject?.stage || 'No stage',
      label: 'Current active project stage inside the shared lifecycle model.',
    },
  ];
}

export default function Projects() {
  const [projects, setProjects] = useState(() => readProjectWorkspace());
  const [activeProjectId, setActiveProjectId] = useState(() => readActiveProjectId(projects));

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || projects[0] || null,
    [activeProjectId, projects]
  );

  const routeOverlay = routeStateOverlays.projects;
  const metrics = summarizeMetrics(projects, activeProject);

  function selectProject(projectId) {
    const nextId = writeActiveProjectId(projectId, projects);
    setActiveProjectId(nextId);
    setProjects(readProjectWorkspace());
  }

  return (
    <section style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.hero}>
          <div style={styles.eyebrow}>Implementation Packet G · Project / Job Spine</div>
          <h1 style={styles.title}>
            Projects are now treated as the operating root of FCA Contractor Command instead of a placeholder route.
          </h1>
          <p style={styles.lead}>
            This surface anchors bid conversion, project state, file continuity, audit events, and Auricrux-guided next actions in one
            workspace. The objective is not a brochure page. The objective is a usable project spine that a contractor can read,
            trust, and act from immediately.
          </p>
          <div style={styles.metricGrid}>
            {metrics.map((metric) => (
              <article key={metric.label} style={styles.metricCard}>
                <span style={styles.metricValue}>{metric.value}</span>
                <span style={styles.metricLabel}>{metric.label}</span>
              </article>
            ))}
          </div>
        </header>

        <div style={styles.layout}>
          <aside style={styles.panel}>
            <h2 style={styles.panelTitle}>Project workspace list</h2>
            <p style={styles.panelLead}>
              Every applicable workflow should resolve back to a project/job record. Select a project to verify that status, next
              action, file linkage, and Auricrux guidance are attached to one spine.
            </p>

            <div style={styles.projectList}>
              {projects.map((project) => {
                const tone = healthTone(project);
                const active = project.id === activeProject?.id;

                return (
                  <article
                    key={project.id}
                    style={styles.projectCard(active)}
                    onClick={() => selectProject(project.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectProject(project.id);
                      }
                    }}
                  >
                    <h3 style={styles.projectName}>{project.name}</h3>
                    <p style={styles.projectMeta}>
                      {project.customer} · {project.stage} · Next: {project.nextAction}
                    </p>
                    <div style={styles.pillRow}>
                      <span style={styles.pill(tone)}>{tone}</span>
                      <span style={styles.pill()}>{project.id}</span>
                      <span style={styles.pill()}>{project.owner}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </aside>

          <main style={styles.panel}>
            {activeProject ? (
              <>
                <h2 style={styles.panelTitle}>{activeProject.name}</h2>
                <p style={styles.panelLead}>{activeProject.auricruxSummary}</p>

                <div style={styles.pillRow}>
                  <span style={styles.pill(healthTone(activeProject))}>{healthTone(activeProject)}</span>
                  <span style={styles.pill()}>{activeProject.stage}</span>
                  <span style={styles.pill()}>{activeProject.customer}</span>
                  <span style={styles.pill()}>{activeProject.id}</span>
                </div>

                <div style={styles.detailGrid}>
                  <article style={styles.detailCard}>
                    <span style={styles.detailLabel}>Next action</span>
                    <span style={styles.detailValue}>{activeProject.nextAction}</span>
                  </article>
                  <article style={styles.detailCard}>
                    <span style={styles.detailLabel}>Owner / due</span>
                    <span style={styles.detailValue}>{activeProject.owner} · {activeProject.due}</span>
                  </article>
                  <article style={styles.detailCard}>
                    <span style={styles.detailLabel}>File spine</span>
                    <span style={styles.detailValue}>{activeProject.fileSpineStatus}</span>
                  </article>
                  <article style={styles.detailCard}>
                    <span style={styles.detailLabel}>Audit spine</span>
                    <span style={styles.detailValue}>{activeProject.auditStatus}</span>
                  </article>
                  <article style={styles.detailCard}>
                    <span style={styles.detailLabel}>Current blocker</span>
                    <span style={styles.detailValue}>{activeProject.blocker || 'No blocker recorded'}</span>
                  </article>
                  <article style={styles.detailCard}>
                    <span style={styles.detailLabel}>Route operating focus</span>
                    <span style={styles.detailValue}>{routeOverlay.primaryDetail}</span>
                  </article>
                </div>

                <div style={styles.actions}>
                  <Link to="/portal/files" style={styles.primary}>Open Project Files</Link>
                  <Link to="/portal/messages" style={styles.secondary}>Open Communication Threads</Link>
                  <Link to="/portal/academy" style={styles.secondary}>Check Team Readiness</Link>
                </div>

                <div style={styles.journey}>
                  {portalJourney.map((step) => (
                    <Link key={step.key} to={step.href} style={styles.journeyLink}>
                      {step.label}
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </main>
        </div>

        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>Project audit continuity</h2>
          <p style={styles.panelLead}>
            No step is complete without output. These audit events demonstrate how qualification, file linkage, coordination, and
            training alignment should write into the same project timeline instead of scattering across disconnected tools.
          </p>
          <div style={styles.auditList}>
            {projectAuditEvents.map((event) => (
              <article key={`${event.time}-${event.eventType}-${event.action}`} style={styles.auditItem}>
                <div style={styles.auditTime}>{event.time} · {event.discipline}</div>
                <p style={styles.auditText}>
                  <strong>{event.action}.</strong> {event.detail} Reason: {event.reason}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
