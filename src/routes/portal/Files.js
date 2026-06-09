import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { readActiveProjectId, readProjectWorkspace } from '../../projectWorkspaceStore';
import { readFilesForProject, readProjectFileWorkspace } from '../../projectFileWorkspaceStore';

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
    gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 0.95fr)',
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
  fileList: {
    display: 'grid',
    gap: '0.85rem',
    marginTop: '1rem',
  },
  fileCard: {
    borderRadius: '1rem',
    padding: '1rem',
    background: 'rgba(2, 6, 23, 0.34)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
  },
  fileTitle: {
    margin: 0,
    fontSize: '1rem',
    color: '#f8fafc',
  },
  fileMeta: {
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
    padding: '0.35rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 700,
    background:
      tone === 'ready'
        ? 'rgba(34, 197, 94, 0.12)'
        : tone === 'blocked'
        ? 'rgba(239, 68, 68, 0.12)'
        : tone === 'review'
        ? 'rgba(245, 158, 11, 0.12)'
        : 'rgba(148, 163, 184, 0.12)',
    color:
      tone === 'ready' ? '#86efac' : tone === 'blocked' ? '#fca5a5' : tone === 'review' ? '#fcd34d' : '#cbd5e1',
    border: '1px solid rgba(148, 163, 184, 0.16)',
  }),
  sidebarCard: {
    borderRadius: '1rem',
    padding: '1rem',
    background: 'rgba(2, 6, 23, 0.34)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    marginTop: '1rem',
  },
  sidebarLabel: {
    display: 'block',
    fontSize: '0.76rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#7dd3fc',
    fontWeight: 700,
  },
  sidebarValue: {
    display: 'block',
    marginTop: '0.45rem',
    color: '#f8fafc',
    lineHeight: 1.6,
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
};

function classifyFileTone(file) {
  const status = `${file.status} ${file.evidenceStatus}`.toLowerCase();
  if (status.includes('ready') || status.includes('approved')) return 'ready';
  if (status.includes('awaiting') || status.includes('pending') || status.includes('needs')) return 'review';
  if (status.includes('blocked') || status.includes('missing')) return 'blocked';
  return 'neutral';
}

function buildDocumentBriefing(project, files) {
  if (!project) {
    return {
      headline: 'No active project selected.',
      summary: 'Select a project to resolve file continuity against the project/job spine.',
      nextMove: 'Return to the Projects route and choose the active project root.',
    };
  }

  const pendingCount = files.filter((file) => classifyFileTone(file) === 'review').length;
  const readyCount = files.filter((file) => classifyFileTone(file) === 'ready').length;
  const categories = [...new Set(files.map((file) => file.category))].join(', ') || 'No categories yet';

  return {
    headline: `${project.name} has ${files.length} project-linked files in the current workspace.`,
    summary: `${readyCount} are execution-ready, ${pendingCount} still need review, and the active categories are ${categories}. This is the beginning of a project-scoped file spine, not detached storage.`,
    nextMove: files[0]?.action || project.nextAction || 'Add the next required project file package.',
  };
}

export default function Files() {
  const [projects] = useState(() => readProjectWorkspace());
  const [activeProjectId] = useState(() => readActiveProjectId(projects));
  const [allFiles] = useState(() => readProjectFileWorkspace());

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || projects[0] || null,
    [activeProjectId, projects]
  );
  const activeFiles = useMemo(
    () => readFilesForProject(activeProject?.id, allFiles),
    [activeProject?.id, allFiles]
  );
  const briefing = useMemo(
    () => buildDocumentBriefing(activeProject, activeFiles),
    [activeFiles, activeProject]
  );

  const metrics = [
    { value: String(activeFiles.length), label: 'Project-attached files visible for the active job record.' },
    { value: String(activeFiles.filter((file) => classifyFileTone(file) === 'ready').length), label: 'Files already positioned for release, review, or field use.' },
    { value: String(activeFiles.filter((file) => classifyFileTone(file) === 'review').length), label: 'Packages still waiting on review, submission, or customer follow-through.' },
    { value: activeProject?.id || 'No project', label: 'Project root currently governing file continuity in this route.' },
  ];

  return (
    <section style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.hero}>
          <div style={styles.eyebrow}>Implementation Packet H · File Spine Baseline</div>
          <h1 style={styles.title}>Files now resolve against the active project/job spine instead of acting like a generic placeholder route.</h1>
          <p style={styles.lead}>
            This route establishes project-scoped document continuity for FCA Contractor Command. Packages, evidence targets, version labels,
            and next actions stay attached to the same project root that Auricrux and the customer portal are already reading.
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
          <main style={styles.panel}>
            <h2 style={styles.panelTitle}>{activeProject?.name || 'Project file workspace'}</h2>
            <p style={styles.panelLead}>{briefing.summary}</p>

            <div style={styles.fileList}>
              {activeFiles.map((file) => (
                <article key={file.fileId} style={styles.fileCard}>
                  <h3 style={styles.fileTitle}>{file.name}</h3>
                  <p style={styles.fileMeta}>
                    {file.category} · {file.discipline} · {file.updated} · Owner: {file.owner}
                  </p>
                  <div style={styles.pillRow}>
                    <span style={styles.pill(classifyFileTone(file))}>{file.status}</span>
                    <span style={styles.pill()}>{file.versionLabel}</span>
                    <span style={styles.pill()}>{file.evidenceStatus}</span>
                  </div>
                  <p style={styles.fileMeta}>Evidence target: {file.linkedEvidenceTarget}</p>
                  <p style={styles.fileMeta}>Next action: {file.action}</p>
                  <p style={styles.fileMeta}>{file.note}</p>
                </article>
              ))}
            </div>
          </main>

          <aside style={styles.panel}>
            <h2 style={styles.panelTitle}>Auricrux document briefing</h2>
            <p style={styles.panelLead}>
              Packet H does not claim full document intelligence yet. It does add a project-aware briefing stub so the route starts behaving like
              a continuity surface rather than static copy.
            </p>

            <article style={styles.sidebarCard}>
              <span style={styles.sidebarLabel}>Headline</span>
              <span style={styles.sidebarValue}>{briefing.headline}</span>
            </article>

            <article style={styles.sidebarCard}>
              <span style={styles.sidebarLabel}>Recommended next move</span>
              <span style={styles.sidebarValue}>{briefing.nextMove}</span>
            </article>

            <article style={styles.sidebarCard}>
              <span style={styles.sidebarLabel}>Coverage enforcement</span>
              <span style={styles.sidebarValue}>
                Every visible file is attached to a project ID, evidence target, version state, and next action. If those links are absent,
                the route is non-compliant with the no-gap spine.
              </span>
            </article>

            <div style={styles.actions}>
              <Link to="/portal/projects" style={styles.primary}>Return to Project Spine</Link>
              <Link to="/portal/messages" style={styles.secondary}>Open Coordination Threads</Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
