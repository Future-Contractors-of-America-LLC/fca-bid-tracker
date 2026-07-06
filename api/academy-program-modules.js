import { academyCatalog } from "./_lib/academyCatalog.js";
import { FCA_ENTITY, formatPrincipalOffice } from "./_lib/entityInfo.js";

const FCA_ENTITY_REFERENCE = `${FCA_ENTITY.legalName}, ${formatPrincipalOffice(false)}`;

const LEGAL_MODULE_CONTENT = {
  "contractor-business-formation-legal": {
    1: {
      objective: "Choose the right entity structure for a Virginia contracting business and document the decision in FCA Contractor Legal Command.",
      lessons: [
        "Compare sole proprietorship, LLC, and S-Corp for liability, tax, and bonding posture",
        "Identify when a Virginia DPOR license must be held by the entity vs. qualifying individual",
        "Record entity choice rationale in /portal/legal entity profile",
      ],
      practicalLab: "Open /portal/legal and draft your entity name, type, and state of formation before SCC filing.",
      contentHtml: `<p>Virginia contractors typically form an <strong>LLC</strong> to separate personal assets from project liability. Document your structure choice in <a href="/portal/legal">Contractor Legal Command</a> before filing.</p><ul><li>LLC: flexible taxation, limited liability, common for Class A/B and residential builders</li><li>Sole prop: simplest start, no liability shield � rarely appropriate at scale</li><li>S-Corp election: tax planning after counsel and CPA review</li></ul><p>FCA reference entity: <strong>${FCA_ENTITY_REFERENCE}</strong>.</p>`,
    },
    2: {
      objective: "Complete Virginia State Corporation Commission (SCC) LLC formation and store the Certificate of Fact.",
      lessons: [
        "File Articles of Organization with Virginia SCC (scc.virginia.gov)",
        "Appoint registered agent with Virginia street address",
        "Obtain Certificate of Fact for banking, insurance, and Google org verification",
      ],
      practicalLab: "Use docs/legal/contractor/BUSINESS_FORMATION_VA_LLC_CHECKLIST.md and upload SCC certificates to /portal/files under Legal � Formation.",
      contentHtml: `<p>Module 2 walks the <strong>Virginia SCC LLC formation</strong> path. After filing, request a <strong>Certificate of Fact</strong> � this is the proof-of-organization document commonly required for banking and vendor verification.</p><ol><li>Reserve or confirm entity name availability</li><li>File Articles of Organization online</li><li>Designate registered agent (Virginia physical address)</li><li>Download Certificate of Fact and register in <a href="/portal/files">Files</a></li></ol><p>Track completion in the <a href="/portal/legal">legal compliance checklist</a>.</p>`,
    },
    3: {
      objective: "Obtain EIN, open business banking, and align NAICS codes with your contracting scope.",
      lessons: [
        "Apply for federal EIN (IRS) using SCC-issued legal name",
        "Open business checking with EIN and Certificate of Fact",
        "Select NAICS codes matching your DPOR classification and trade scope",
      ],
      practicalLab: "Add EIN confirmation and banking milestone notes in /portal/legal checklist item 'Federal EIN obtained'.",
      contentHtml: `<p>Your <strong>EIN</strong> is the tax identity for contracts, 1099s, and insurance applications. Never commingle personal and project funds.</p><p>Store EIN letter and bank resolution documents on the project file spine under <code>Legal � Formation</code>.</p>`,
    },
    4: {
      objective: "Execute operating agreement discipline, initial insurance, and load credentials into FCA.",
      lessons: [
        "Draft and execute LLC operating agreement (member roles, capital, dissolution)",
        "Quote general liability and workers compensation before first customer contract",
        "Load licenses and COI expirations into /portal/legal license vault",
      ],
      practicalLab: "Complete all Formation checklist items in /portal/legal and link to Academy credential review.",
      contentHtml: `<p>Close Module 4 by confirming your <strong>operating agreement</strong>, <strong>GL/WC policies</strong>, and <strong>FCA legal workspace</strong> are active. Use template library entries for owner contracts before mobilization.</p><p>Next track: <a href="/academy/programs/contractor-construction-law-essentials/modules/1">Construction Law Essentials</a> or <a href="/academy/programs/virginia-dpor-residential-license-prep/modules/1">Virginia DPOR Prep</a>.</p>`,
    },
  },
  "contractor-construction-law-essentials": {
    1: {
      objective: "Understand Virginia contract fundamentals and consumer protection requirements for residential work.",
      lessons: [
        "Written contract before work begins on residential projects",
        "Required notices, right-to-cancel, and disclosure alignment with DPOR",
        "Scope, price, schedule, and warranty terms in owner agreements",
      ],
      practicalLab: "Open OWNER_CONTRACT_VA_RESIDENTIAL_TEMPLATE.md and create a draft agreement record in /portal/legal.",
      contentHtml: `<p>Virginia residential contractors must maintain <strong>written agreements</strong> with consumer-protection notices. Use the FCA <a href="/legal/contractor-resources">template library</a> � not verbal scope alone.</p>`,
    },
    2: {
      objective: "Manage subcontractor agreements, indemnity, and certificate of insurance collection.",
      lessons: [
        "Master subcontract terms: scope, payment, insurance, indemnity",
        "Additional insured and waiver of subrogation requirements",
        "COI tracking sheet discipline before sub mobilization",
      ],
      practicalLab: "Add a subcontractor agreement row in /portal/legal and attach COI in /portal/files.",
      contentHtml: `<p>Never allow subcontract mobilization without <strong>executed subcontract</strong> and <strong>current COI</strong>. Track expirations in the license vault.</p>`,
    },
    3: {
      objective: "Execute mechanic's lien waiver sequencing for progress and final payments.",
      lessons: [
        "Conditional waivers tied to specified progress payments",
        "Unconditional waivers only after cleared funds",
        "Lien waiver register linked to billing and project files",
      ],
      practicalLab: "Log a conditional lien waiver in /portal/legal tied to a progress draw.",
      contentHtml: `<p><strong>Conditional</strong> waivers become effective upon receipt of payment. <strong>Unconditional</strong> waivers follow cleared funds � never sign early.</p>`,
    },
    4: {
      objective: "Close projects with documentation discipline and dispute prevention.",
      lessons: [
        "Change orders in writing before extra work",
        "Final lien waivers, punch list, and warranty transfer",
        "Audit spine: permits, inspections, communications on /portal/audit",
      ],
      practicalLab: "Mark lien waiver process checklist complete and run closeout file review in /portal/files.",
      contentHtml: `<p>Disputes are prevented by <strong>written change orders</strong>, <strong>payment clarity</strong>, and <strong>file evidence</strong> on the FCA audit spine.</p>`,
    },
  },
};

function parseModuleCount(program) {
  const course = program.courses?.[0];
  if (course?.lessons) return Number(course.lessons) || 4;
  const match = String(program.duration || "").match(/(\d+)/);
  return match ? Number(match[1]) : 4;
}

function attachModuleMedia(program, moduleNumber, module) {
  const course = program.courses?.[0];
  const lessonMedia = course?.lessonMedia || [];
  const stem = `module-${String(moduleNumber).padStart(2, "0")}`;
  const mediaBase = `/academy/media/${program.key}`;
  const slot = lessonMedia[moduleNumber - 1] || {};
  const auricruxLectureUrl = slot.auricruxLectureUrl || slot.lectureUrl || `${mediaBase}/${stem}-auricrux-lecture.html`;
  const lectureVideoUrl =
    slot.lectureVideoUrl || `/academy/media/videos/${program.key}/${stem}-auricrux-lecture.webm`;

  return {
    ...module,
    lessonMedia: lessonMedia.length ? lessonMedia : module.lessonMedia,
    auricruxLectureUrl,
    auricruxSkillsDemoUrl: slot.skillsDemoUrl || `${mediaBase}/${stem}-auricrux-skills-demo.html`,
    labUrl: slot.labDemoUrl || `${mediaBase}/${stem}-lab.html`,
    lectureUrl: slot.lectureUrl || auricruxLectureUrl,
    mediaUrl: auricruxLectureUrl,
    lectureVideoUrl,
    mediaType: slot.lectureVideoUrl ? "video" : "html",
  };
}

function buildModules(program) {
  const course = program.courses?.[0];
  if (Array.isArray(course?.moduleOutlines) && course.moduleOutlines.length > 0) {
    return course.moduleOutlines.map((outline, index) => attachModuleMedia(program, index + 1, {
      ...outline,
      moduleNumber: outline.moduleNumber || index + 1,
      title: outline.title || course.lessonTitles?.[index] || `Module ${index + 1}`,
      lab: course.lab,
      knowledgeCheck: outline.knowledgeCheck || {
        passingScore: outline.assessment?.passingScore || 80,
        questionCount: 5,
      },
    }));
  }
  const titles = course?.lessonTitles || [];
  const count = parseModuleCount(program);
  const legalContent = LEGAL_MODULE_CONTENT[program.key] || {};

  return Array.from({ length: count }, (_, index) => {
    const moduleNumber = index + 1;
    const titleFromCatalog = titles[index] || `Module ${moduleNumber}`;
    const title = titleFromCatalog.replace(/^Module \d+ �\s*/i, "").replace(/^Lesson \d+ �\s*/i, "");
    const enriched = legalContent[moduleNumber] || {};

    return attachModuleMedia(program, moduleNumber, {
      moduleNumber,
      title,
      objective: enriched.objective || program.goal,
      lessons: enriched.lessons || [titleFromCatalog],
      practicalLab: enriched.practicalLab || course?.lab || program.linkedLabel,
      lab: course?.lab,
      contentHtml: enriched.contentHtml,
      knowledgeCheck: {
        passingScore: 80,
        questionCount: 5,
      },
    });
  });
}

export function getAcademyProgramDetail(programKey) {
  const program = academyCatalog.programs.find((item) => item.key === programKey);
  if (!program) return null;

  const modules = buildModules(program);
  return {
    program: {
      key: program.key,
      title: program.title,
      credential: program.credential,
      audience: program.audience,
      duration: program.duration,
      format: program.format,
      goal: program.goal,
      outcomes: program.outcomes,
      linkedSurface: program.linkedSurface,
      linkedLabel: program.linkedLabel,
      deliveryModel: program.format,
      stateCode: program.stateCode,
      pathwayKey: program.pathwayKey,
      topicKey: program.topicKey,
      vdoe: program.vdoe,
      proposedTrack: program.proposedTrack,
      apprenticeshipTrack: program.apprenticeshipTrack,
      completionRule: "Complete all modules with knowledge checks at 80% or higher.",
    },
    modules,
    completionRequirements: {
      modules: modules.length,
      knowledgeCheckPassingScore: "80%",
      practicalLab: "Complete linked portal lab surfaces where indicated.",
      credential: program.credential,
      vdoeStudentCompetencyRecord: program.vdoe?.studentCompetencyRecordRequired === true,
      hqwblEvidence: program.vdoe?.hqwblRequired === true,
      safetyGate: program.vdoe?.oshaComplianceRequired === true,
    },
  };
}
