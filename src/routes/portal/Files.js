import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { readActiveProjectId, readProjectWorkspace } from '../../projectWorkspaceStore';
import {
  createProjectFile,
  readFilesForProject,
  readProjectFileWorkspace,
  updateProjectFile,
} from '../../projectFileWorkspaceStore';

const REQUIRED_PACKAGE_RULES = [
  {
    key: 'bid-summary',
    label: 'Bid / owner review package',
    categories: ['Bid'],
  },
  {
    key: 'permit-package',
    label: 'Permit / drawing package',
    categories: ['Permit', 'Drawing'],
  },
  {
    key: 'coordination-log',
    label: 'Coordination / RFI register',
    categories: ['Coordination'],
  },
  {
    key: 'field-kickoff',
    label: 'Field / onboarding package',
    categories: ['Field', 'Safety'],
  },
];

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: 'linear-gradient(180deg, #081120 0%, #0f172a 45%, #111827 100%)',
    color: '#e5eefb',
    padding: '3rem 1.5rem 4rem',
  },
  wrap: {
    maxWidth: '1240px',
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
    gridTemplateColumns: 'minmax(0, 1.5fr) minmax(360px, 0.95fr)',
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
    border: 'none',
    cursor: 'pointer',
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
    cursor: 'pointer',
  },
  formGrid: {
    display: 'grid',
    gap: '0.8rem',
    marginTop: '1rem',
  },
  input: {
    width: '100%',
    borderRadius: '0.9rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    background: 'rgba(15, 23, 42, 0.72)',
    color: '#f8fafc',
    padding: '0.9rem 1rem',
    fontSize: '0.95rem',
  },
  select: {
    width: '100%',
    borderRadius: '0.9rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    background: 'rgba(15, 23, 42, 0.72)',
    color: '#f8fafc',
    padding: '0.9rem 1rem',
    fontSize: '0.95rem',
  },
  helperList: {
    margin: '0.9rem 0 0',
    paddingLeft: '1rem',
    color: '#dbe7f5',
    lineHeight: 1.65,
  },
};

function classifyFileTone(file) {
  const status = `${file.status} ${file.evidenceStatus}`.toLowerCase();
  if (status.includes('ready') || status.includes('approved')) return 'ready';
  if (status.includes('awaiting') || status.includes('pending') || status.includes('needs')) return 'review';
  if (status.includes('blocked') || status.includes('missing')) return 'blocked';
  return 'neutral';
}

function detectMissingPackages(files) {
  return REQUIRED_PACKAGE_RULES.filter((rule) => !files.some((file) => rule.categories.includes(file.category)));
}

function buildDocumentBriefing(project, files) {
  if (!project) {
    return {
      headline: 'No active project selected.',
      summary: 'Select a project to resolve file continuity against the project/job spine.',
      nextMove: 'Return to the Projects route and choose the active project root.',
      missingPackages: REQUIRED_PACKAGE_RULES,
      riskLevel: 'blocked',
    };
  }

  const pendingCount = files.filter((file) => classifyFileTone(file) === 'review').length;
  const readyCount = files.filter((file) => classifyFileTone(file) === 'ready').length;
  const missingPackages = detectMissingPackages(files);
  const categories = [...new Set(files.map((file) => file.category))].join(', ') || 'No categories yet';
  const riskLevel = missingPackages.length ? 'blocked' : pendingCount ? 'review' : 'ready';

  let nextMove = project.nextAction || 'Add the next required project file package.';
  if (missingPackages.length) {
    nextMove = `Add ${missingPackages[0].label.toLowerCase()} to keep the project spine complete.`;
  } else if (pendingCount) {
    nextMove = files.find((file) => classifyFileTone(file) === 'review')?.action || nextMove;
  }

  return {
    headline: `${project.name} has ${files.length} project-linked files in the current workspace.`,
    summary: `${readyCount} are execution-ready, ${pendingCount} still need review, and the active categories are ${categories}. ${missingPackages.length ? `Auricrux detected ${missingPackages.length} missing required package lane(s).` : 'Required package lanes are currently represented.'}`,
    nextMove,
    missingPackages,
    riskLevel,
  };
}

function initialFormState(projectId) {
  return {
    name: '',
    category: 'Bid',
    discipline: 'Preconstruction',
    status: 'Needs review',
    evidenceStatus: 'Classification pending',
    linkedEvidenceTarget: '',
    action: '',
    owner: '',
    note: '',
    projectId: projectId || '',
  };
}

export default function Files() {
  const [projects] = useState(() => readProjectWorkspace());
  const [activeProjectId] = useState(() => readActiveProjectId(projects));
  const [allFiles, setAllFiles] = useState(() => readProjectFileWorkspace());
  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || projects[0] || null,
    [activeProjectId, projects]
  );
  const [formState, setFormState] = useState(() => initialFormState(activeProject?.id));

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
    { value: String(briefing.missingPackages.length), label: 'Required package lanes Auricrux currently sees as missing.' },
  ];

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: value,
      projectId: activeProject?.id || current.projectId,
    }));
  }

  function handleCreateFile(event) {
    event.preventDefault();
    if (!activeProject) return;

    const nextFiles = createProjectFile({
      ...formState,
      projectId: activeProject.id,
      ownerObjectId: activeProject.id,
      ownerObjectType: 'Project',
      versionLabel: 'Rev 1',
      action: formState.action || 'Review new upload',
      owner: formState.owner || activeProject.owner,
      note: formState.note || 'Created from Packet I file intake surface.',
    });

    setAllFiles(nextFiles);
    setFormState(initialFormState(activeProject.id));
  }

  function markReady(fileId) {
    const nextFiles = updateProjectFile(fileId, {
      status: 'Ready for release',
      evidenceStatus: 'Evidence linked',
      action: 'Move to downstream review',
    });
    setAllFiles(nextFiles);
  }

  return (
    <section style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.hero}>
          <div style={styles.eyebrow}>Implementation Packet I · File Mutation + Briefing Upgrade</div>
          <h1 style={styles.title}>The file spine now supports project-aware file creation, missing-package detection, and stronger Auricrux briefing output.</h1>
          <p style={styles.lead}>
            Packet I moves this route from read-only visibility to the start of a real workflow surface. Users can create project-linked file artifacts,
            Auricrux can detect missing required package lanes, and the route now explains risk and next move in the context of the active project root.
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
                  <div style={styles.actions}>
                    <button type="button" style={styles.secondary} onClick={() => markReady(file.fileId)}>
                      Mark Ready
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </main>

          <aside style={styles.panel}>
            <h2 style={styles.panelTitle}>Auricrux document briefing</h2>
            <p style={styles.panelLead}>
              The briefing now identifies missing package lanes, classifies project document risk, and recommends the next action based on actual file state.
            </p>

            <article style={styles.sidebarCard}>
              <span style={styles.sidebarLabel}>Headline</span>
              <span style={styles.sidebarValue}>{briefing.headline}</span>
            </article>

            <article style={styles.sidebarCard}>
              <span style={styles.sidebarLabel}>Risk level</span>
              <span style={styles.sidebarValue}>{briefing.riskLevel}</span>
            </article>

            <article style={styles.sidebarCard}>
              <span style={styles.sidebarLabel}>Recommended next move</span>
              <span style={styles.sidebarValue}>{briefing.nextMove}</span>
            </article>

            <article style={styles.sidebarCard}>
              <span style={styles.sidebarLabel}>Missing package detection</span>
              {briefing.missingPackages.length ? (
                <ul style={styles.helperList}>
                  {briefing.missingPackages.map((rule) => (
                    <li key={rule.key}>{rule.label}</li>
                  ))}
                </ul>
              ) : (
                <span style={styles.sidebarValue}>Required package lanes are currently represented in this project workspace.</span>
              )}
            </article>

            <article style={styles.sidebarCard}>
              <span style={styles.sidebarLabel}>Add project file artifact</span>
              <form style={styles.formGrid} onSubmit={handleCreateFile}>
                <input style={styles.input} name="name" value={formState.name} onChange={handleChange} placeholder="File name" required />
                <select style={styles.select} name="category" value={formState.category} onChange={handleChange}>
                  <option value="Bid">Bid</option>
                  <option value="Permit">Permit</option>
                  <option value="Drawing">Drawing</option>
                  <option value="Coordination">Coordination</option>
                  <option value="Field">Field</option>
                  <option value="Safety">Safety</option>
                  <option value="Closeout">Closeout</option>
                  <option value="Finance">Finance</option>
                </select>
                <input style={styles.input} name="discipline" value={formState.discipline} onChange={handleChange} placeholder="Discipline" />
                <input style={styles.input} name="linkedEvidenceTarget" value={formState.linkedEvidenceTarget} onChange={handleChange} placeholder="Evidence target" />
                <input style={styles.input} name="action" value={formState.action} onChange={handleChange} placeholder="Next action" />
                <input style={styles.input} name="owner" value={formState.owner} onChange={handleChange} placeholder="Owner" />
                <input style={styles.input} name="note" value={formState.note} onChange={handleChange} placeholder="Operational note" />
                <button type="submit" style={styles.primary}>Attach File to Project Spine</button>
              </form>
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
