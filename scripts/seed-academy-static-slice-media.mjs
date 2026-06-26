#!/usr/bin/env node
/**
 * Generate missing static-slice academy media HTML for catalog programs.
 * Idempotent: only writes files that are missing on disk.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { academyCatalog } from "../src/academyCatalog.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mediaRoot = path.join(root, "public", "academy", "media");

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function publicPathExists(url = "") {
  if (!url?.startsWith("/academy/media/")) return true;
  const relative = url.split("#")[0].split("?")[0].replace(/^\//, "");
  return fs.existsSync(path.join(root, "public", relative));
}

function auricruxLectureHtml({ programTitle, programKey, lessonTitle, lessonIndex, lessonCount, lab }) {
  const moduleTitle = lessonTitle.replace(/^Lesson\s+\d+\s*·\s*/i, "").replace(/^Module\s+\d+\s*·\s*/i, "");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Auricrux Lecture · Module ${lessonIndex} | FCA Academy</title>
<style>
body { font-family: Georgia, "Times New Roman", serif; margin: 0; background: #0f172a; color: #f8fafc; }
.wrap { max-width: 920px; margin: 0 auto; padding: 28px 24px 48px; }
.hero { background: linear-gradient(135deg, #475569, #0f172a); border-radius: 18px; padding: 24px; margin-bottom: 24px; }
.badge { display: inline-block; background: rgba(255,255,255,0.15); color: #fff; font: 700 11px/1 system-ui; padding: 6px 10px; border-radius: 999px; letter-spacing: 0.06em; text-transform: uppercase; }
.hero h1 { font-size: 1.75rem; margin: 12px 0 8px; line-height: 1.25; }
.meta { color: rgba(255,255,255,0.85); font: 500 14px/1.6 system-ui; }
.chapter { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 20px; margin-bottom: 18px; }
.chapter-head h2 { margin: 8px 0 0; font-size: 1.15rem; color: #e2e8f0; }
.chapter-num { color: #93c5fd; font: 700 12px/1 system-ui; text-transform: uppercase; letter-spacing: 0.05em; }
.player { background: #0f172a; border-radius: 12px; overflow: hidden; margin-top: 14px; border: 1px solid #475569; }
.player-bar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #334155; font: 600 13px/1 system-ui; }
.play-dot { width: 12px; height: 12px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,0.25); }
.player-time { margin-left: auto; color: #cbd5e1; }
.transcript { padding: 18px 20px; line-height: 1.8; color: #cbd5e1; font-size: 15px; }
.footer { margin-top: 24px; color: #64748b; font: 500 13px/1.6 system-ui; text-align: center; }
</style>
</head>
<body>
<div class="wrap">
<div class="hero">
<span class="badge">Auricrux Recorded Lecture</span>
<h1>Module ${lessonIndex}: ${escapeHtml(moduleTitle)}</h1>
<div class="meta">${escapeHtml(programTitle)} · ${escapeHtml(programKey)} · Taught by Auricrux</div>
</div>
<section id="lesson-${lessonIndex}" class="chapter">
  <div class="chapter-head">
    <span class="chapter-num">Lesson ${lessonIndex} of ${lessonCount}</span>
    <h2>${escapeHtml(lessonTitle)}</h2>
  </div>
  <div class="player" role="region" aria-label="Auricrux recorded lecture lesson ${lessonIndex}">
    <div class="player-bar">
      <span class="play-dot"></span>
      <span class="player-label">Auricrux · Operator lecture</span>
      <span class="player-time">~8 min</span>
    </div>
    <div class="transcript">
      <p><strong>Lesson:</strong> ${escapeHtml(lessonTitle)}</p>
      <p>This segment covers ${escapeHtml(moduleTitle)} with jobsite-direct steps inside Contractor Command — no biography, just the standard and the next move.</p>
      <p>${escapeHtml(lab || "Complete the live portal lab and document evidence on the governed file spine before your knowledge check.")}</p>
    </div>
  </div>
</section>
<p class="footer">FCA Academy · Auricrux recorded lecture · ${escapeHtml(programKey)}</p>
</div>
</body>
</html>
`;
}

function skillsDemoHtml({ programTitle, programKey, lessonTitle, lessonIndex, lab }) {
  const moduleTitle = lessonTitle.replace(/^Lesson\s+\d+\s*·\s*/i, "").replace(/^Module\s+\d+\s*·\s*/i, "");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Auricrux Skills Demo · Module ${lessonIndex} | FCA Academy</title>
<style>
body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; background: #052e16; color: #f0fdf4; }
.wrap { max-width: 920px; margin: 0 auto; padding: 28px 24px 48px; }
.hero { background: linear-gradient(135deg, #15803d, #052e16); border-radius: 18px; padding: 24px; margin-bottom: 24px; }
.hero h1 { font-size: 1.65rem; margin: 12px 0 8px; }
.meta { color: #bbf7d0; font-size: 14px; }
.demo-step { background: #14532d; border: 1px solid #22c55e; border-radius: 16px; padding: 20px; margin-bottom: 18px; }
.demo-badge { color: #86efac; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.demo-step h3 { margin: 8px 0 12px; color: #f0fdf4; }
.demo-player { background: #052e16; border-radius: 12px; overflow: hidden; border: 1px solid #166534; }
.demo-bar { padding: 12px 16px; background: #166534; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 10px; }
.rec { width: 10px; height: 10px; border-radius: 50%; background: #ef4444; }
.demo-intro { padding: 16px 20px 0; line-height: 1.75; color: #dcfce7; margin: 0; }
.demo-list { padding: 18px 20px 18px 36px; line-height: 1.75; color: #dcfce7; margin: 0; }
.footer { margin-top: 24px; color: #4ade80; font-size: 13px; text-align: center; opacity: 0.8; }
</style>
</head>
<body>
<div class="wrap">
<div class="hero">
<div class="meta">Auricrux Skills Demonstration</div>
<h1>Module ${lessonIndex}: ${escapeHtml(moduleTitle)}</h1>
<div class="meta">${escapeHtml(programTitle)} · ${escapeHtml(programKey)}</div>
</div>
<section id="step-${lessonIndex}" class="demo-step">
  <div class="demo-badge">Skills Demo ${lessonIndex}</div>
  <h3>Auricrux in the field: ${escapeHtml(moduleTitle)}</h3>
  <div class="demo-player">
    <div class="demo-bar"><span class="rec"></span> Auricrux live demonstration · Watch, then replicate</div>
    <p class="demo-intro">This walkthrough covers ${escapeHtml(moduleTitle)} on a jobsite or in your FCA portal lab — step by step, no biography.</p>
    <ol class="demo-list">
      <li>Review safety and gather required tools or references.</li>
      <li>${escapeHtml(lab || "Complete the live portal lab with Auricrux guidance.")}</li>
      <li>Document results with photos, measurements, or worksheets as required.</li>
      <li>Complete rubric self-check and submit deliverable for review.</li>
    </ol>
  </div>
</section>
<p class="footer">Auricrux skills demonstration · FCA Academy</p>
</div>
</body>
</html>
`;
}

function labHtml({ programTitle, programKey, lessonTitle, lessonIndex, lab }) {
  const moduleTitle = lessonTitle.replace(/^Lesson\s+\d+\s*·\s*/i, "").replace(/^Module\s+\d+\s*·\s*/i, "");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(moduleTitle)} Lab | FCA Academy</title>
<style>
body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; background: #f0fdf4; color: #0f172a; }
.wrap { max-width: 820px; margin: 0 auto; padding: 28px 24px 40px; }
.badge { display: inline-block; background: #15803d; color: #fff; font: 700 12px/1 system-ui; padding: 6px 10px; border-radius: 999px; letter-spacing: 0.04em; text-transform: uppercase; }
h1 { font-size: 1.55rem; margin: 14px 0 8px; line-height: 1.25; }
.meta { color: #475569; font-size: 14px; margin-bottom: 20px; }
.card { background: #fff; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px 20px; margin-bottom: 16px; }
.card h2 { margin: 0 0 10px; font-size: 1rem; color: #15803d; }
.card p, .card li { line-height: 1.75; color: #334155; }
.card ol { padding-left: 22px; margin: 0; }
.note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 16px; color: #92400e; font-size: 14px; }
.footer { margin-top: 24px; color: #64748b; font-size: 13px; }
</style>
</head>
<body>
<div class="wrap">
<span class="badge">Practical Lab Workbook</span>
<h1>Module ${lessonIndex}: ${escapeHtml(moduleTitle)}</h1>
<div class="meta">${escapeHtml(programTitle)} &middot; ${escapeHtml(programKey)}</div>
<div class="card">
<h2>Lab overview</h2>
<p>${escapeHtml(lab || `Complete the live portal lab for ${moduleTitle} with Auricrux guidance.`)}</p>
</div>
<div class="card">
<h2>Step-by-step procedure</h2>
<ol>
<li>Review lab safety requirements and gather required tools and materials.</li>
<li>${escapeHtml(lab || `Complete the live portal lab for ${moduleTitle}.`)}</li>
<li>Document results with photos, measurements, or worksheets as required.</li>
<li>Complete rubric self-check and submit deliverable for review.</li>
</ol>
</div>
<div class="card">
<h2>Submission deliverable</h2>
<p>${escapeHtml(moduleTitle)} operator evidence packet</p>
</div>
<div class="note">Safety first: stop work and escalate hazards before proceeding with any field lab activity.</div>
<p class="footer">FCA Academy lab workbook &middot; printable and field-ready</p>
</div>
</body>
</html>
`;
}

function writeIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

let created = 0;
let skipped = 0;

for (const program of academyCatalog.programs) {
  for (const course of program.courses || []) {
    const lessonCount = course.lessons || 0;
    const media = course.lessonMedia || [];
    for (let i = 0; i < lessonCount; i += 1) {
      const slot = media[i] || {};
      const lessonIndex = i + 1;
      const lessonTitle = slot.title || course.lessonTitles?.[i] || `Lesson ${lessonIndex}`;
      const context = {
        programTitle: program.title,
        programKey: program.key,
        lessonTitle,
        lessonIndex,
        lessonCount,
        lab: course.lab,
      };

      const files = [
        { url: slot.auricruxLectureUrl, content: auricruxLectureHtml(context) },
        { url: slot.skillsDemoUrl, content: skillsDemoHtml(context) },
        { url: slot.labDemoUrl, content: labHtml(context) },
      ];

      for (const { url, content } of files) {
        if (!url?.startsWith("/academy/media/")) continue;
        const relative = url.split("#")[0].split("?")[0].replace(/^\//, "");
        const filePath = path.join(root, "public", relative);
        if (writeIfMissing(filePath, content)) {
          created += 1;
          console.log(`Wrote ${relative}`);
        } else {
          skipped += 1;
        }
      }
    }
  }
}

console.log(`\nStatic slice media seed: ${created} file(s) created, ${skipped} already present.`);
process.exit(0);
