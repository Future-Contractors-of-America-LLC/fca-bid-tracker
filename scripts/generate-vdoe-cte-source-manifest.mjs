import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { VIRGINIA_AC_CTE_COURSES } from "../src/virginiaCteCourses.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicManifestPath = path.join(root, "public", "config", "vdoe-cte-source-manifest.json");
const sourceModulePath = path.join(root, "src", "vdoeCteSourceManifest.js");
const parserVersion = "2026-07-03.1";
const copyPolicy = "Official curriculum body text remains external; FCA stores metadata, source URLs, hashes, and cartridge structure only.";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtml(value = "") {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, numeric) => String.fromCodePoint(Number.parseInt(numeric, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function textFromHtml(value = "") {
  return decodeHtml(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function absoluteUrl(href, baseUrl) {
  if (!href) return null;
  return new URL(decodeHtml(href), baseUrl).href;
}

function extractHeadline(html) {
  const match = html.match(/<h1[^>]*class=["'][^"']*headline[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
  return match ? textFromHtml(match[1]) : null;
}

function extractCourseCode(html) {
  const match = html.match(/<div[^>]*class=["'][^"']*course-code[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  const text = match ? textFromHtml(match[1]) : "";
  return text.match(/course\s*code:\s*([A-Z0-9.-]+)/i)?.[1] || null;
}

function extractLabeledField(html, label) {
  const fieldPattern = new RegExp(
    `<strong>\\s*${escapeRegExp(label)}\\s*:?\\s*<\\/strong>\\s*(?:<span[^>]*>)?([\\s\\S]*?)(?:<\\/span>|<\\/div>)`,
    "i",
  );
  const match = html.match(fieldPattern);
  return match ? textFromHtml(match[1]) || null : null;
}

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const numeric = String(value).match(/\d+(?:\.\d+)?/)?.[0];
  if (!numeric) return null;
  return Number(numeric);
}

function parseWeeks(value) {
  return parseNumber(value);
}

function parseGradeLevels(value) {
  if (!value) return [];
  return [...String(value).matchAll(/\d+/g)].map((match) => Number(match[0]));
}

function parseYesNo(value) {
  if (!value) return null;
  if (/^yes$/i.test(value.trim())) return true;
  if (/^no$/i.test(value.trim())) return false;
  return null;
}

function extractAnchors(html, baseUrl) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
    .map((match) => {
      const href = match[1].match(/href=["']([^"']+)["']/i)?.[1] || null;
      return {
        text: textFromHtml(match[2]),
        href: absoluteUrl(href, baseUrl),
      };
    })
    .filter((anchor) => anchor.href && anchor.text);
}

function findAnchor(anchors, label) {
  const normalizedLabel = label.toLowerCase();
  return anchors.find((anchor) => anchor.text.toLowerCase().includes(normalizedLabel))?.href || null;
}

function artifactAvailability(url) {
  return url ? "linked-on-public-course-page" : "not-published-on-public-course-page";
}

function artifactAccess(url) {
  if (!url) return "not-published-on-public-course-page";
  return url.includes("instructure.com") ? "canvas-url-login-may-be-required" : "public-url";
}

function extractIndustryCredentials(html, baseUrl) {
  const start = html.search(/Industry Credentials/i);
  if (start < 0) return [];
  const end = html.indexOf("</ul>", start);
  const block = html.slice(start, end > start ? end : start + 8000);
  return extractAnchors(block, baseUrl)
    .filter((anchor) => anchor.href.includes("/resources/credentials/"))
    .map((anchor) => ({ title: anchor.text, url: anchor.href }));
}

function findEndOfCentralDirectory(buffer) {
  const min = Math.max(0, buffer.length - 0xffff - 22);
  for (let offset = buffer.length - 22; offset >= min; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return -1;
}

function readZipEntries(buffer) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  if (eocdOffset < 0) return [];
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  let offset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = [];

  for (let index = 0; index < totalEntries; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;
    const flags = buffer.readUInt16LE(offset + 8);
    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const nameStart = offset + 46;
    const encoding = flags & 0x0800 ? "utf8" : "latin1";
    const name = buffer.toString(encoding, nameStart, nameStart + nameLength);
    entries.push({ name, compressionMethod, compressedSize, uncompressedSize, localHeaderOffset });
    offset = nameStart + nameLength + extraLength + commentLength;
  }

  return entries;
}

function extractZipEntry(buffer, entry) {
  const offset = entry.localHeaderOffset;
  if (buffer.readUInt32LE(offset) !== 0x04034b50) return null;
  const nameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const dataStart = offset + 30 + nameLength + extraLength;
  const compressed = buffer.subarray(dataStart, dataStart + entry.compressedSize);
  if (entry.compressionMethod === 0) return compressed;
  if (entry.compressionMethod === 8) return zlib.inflateRawSync(compressed);
  return null;
}

function summarizeCartridge(buffer) {
  const entries = readZipEntries(buffer);
  const imsEntry = entries.find((entry) => entry.name === "imsmanifest.xml");
  const imsXml = imsEntry ? extractZipEntry(buffer, imsEntry)?.toString("utf8") || "" : "";
  const manifestTitles = [...imsXml.matchAll(/<title>([\s\S]*?)<\/title>/gi)]
    .map((match) => textFromHtml(match[1]))
    .filter(Boolean);
  const entryNames = entries.map((entry) => entry.name).sort();

  return {
    sha256: sha256(buffer),
    bytes: buffer.byteLength,
    zipEntryCount: entries.length,
    zipEntryNamesSha256: sha256(entryNames.join("\n")),
    hasImsManifest: Boolean(imsEntry),
    imsManifestSha256: imsXml ? sha256(imsXml) : null,
    imsManifestTitleCount: manifestTitles.length,
    imsManifestTitleSha256: manifestTitles.length ? sha256(manifestTitles.join("\n")) : null,
    wikiContentFileCount: entries.filter((entry) => entry.name.startsWith("wiki_content/")).length,
    webResourceFileCount: entries.filter((entry) => entry.name.startsWith("web_resources/")).length,
    nonCcAssessmentFileCount: entries.filter((entry) => entry.name.startsWith("non_cc_assessments/")).length,
    moduleMetaPresent: entries.some((entry) => entry.name === "course_settings/module_meta.xml"),
    syllabusPresent: entries.some((entry) => entry.name === "course_settings/syllabus.xml"),
    likelyCompetencyResourceCount: entries.filter((entry) => /competenc|student|record|scr|osha|workplace/i.test(entry.name)).length,
  };
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "FCA-Academy-VDOE-CTE-source-verifier" },
    redirect: "follow",
    signal: AbortSignal.timeout(45000),
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    ok: response.ok,
    status: response.status,
    finalUrl: response.url,
    contentType: response.headers.get("content-type"),
    buffer,
  };
}

async function buildOfficialCourseRecord(course, verifiedAt) {
  if (course.proposedTrack) {
    return {
      key: course.key,
      title: course.title,
      proposedTrack: true,
      sourceUrl: null,
      officialMetadata: null,
      officialArtifacts: null,
      sourceVerification: {
        status: "proposed-fca-track",
        verifiedAt,
        parserVersion,
        copyPolicy,
        note: "Building Trades III is an FCA proposed apprenticeship specialization and has no adopted VDOE course page yet.",
      },
    };
  }

  const page = await fetchBuffer(course.cteResourceUrl);
  const html = page.buffer.toString("utf8");
  const anchors = extractAnchors(html, course.cteResourceUrl);
  const curriculumUrl = findAnchor(anchors, "View Curriculum");
  const studentCompetencyRecordUrl = findAnchor(anchors, "Download Student Competency Record");
  const cartridgeUrl = findAnchor(anchors, "Download Cartridge File");
  const cartridge = cartridgeUrl ? await fetchBuffer(cartridgeUrl) : null;

  return {
    key: course.key,
    title: course.title,
    proposedTrack: false,
    sourceUrl: course.cteResourceUrl,
    page: {
      status: page.status,
      ok: page.ok,
      finalUrl: page.finalUrl,
      contentType: page.contentType,
      bytes: page.buffer.byteLength,
      sha256: sha256(page.buffer),
    },
    officialMetadata: {
      courseTitle: extractHeadline(html),
      courseCode: extractCourseCode(html),
      scedCode: extractLabeledField(html, "SCED Code"),
      virginiaExtendedDescription: extractLabeledField(html, "Virginia Extended Description"),
      suggestedGradeLevel: parseGradeLevels(extractLabeledField(html, "Suggested Grade Level")),
      duration: extractLabeledField(html, "Duration"),
      durationWeeks: parseWeeks(extractLabeledField(html, "Duration")),
      hours: parseNumber(extractLabeledField(html, "Hours")),
      credits: parseNumber(extractLabeledField(html, "Credits")),
      prerequisite: extractLabeledField(html, "Prerequisite") || "None",
      oshaComplianceRequired: parseYesNo(extractLabeledField(html, "OSHA Compliance Required?")),
      ctso: extractLabeledField(html, "CTSO"),
      nonTraditional: extractLabeledField(html, "Non-Traditional?"),
      industryCredentials: extractIndustryCredentials(html, course.cteResourceUrl),
    },
    officialArtifacts: {
      curriculumUrl,
      studentCompetencyRecordUrl,
      cartridgeUrl,
      curriculumAvailability: artifactAvailability(curriculumUrl),
      studentCompetencyRecordAvailability: artifactAvailability(studentCompetencyRecordUrl),
      cartridgeAvailability: artifactAvailability(cartridgeUrl),
      curriculumAccess: artifactAccess(curriculumUrl),
      studentCompetencyRecordAccess: artifactAccess(studentCompetencyRecordUrl),
      cartridge: cartridge
        ? {
            url: cartridgeUrl,
            status: cartridge.status,
            ok: cartridge.ok,
            finalUrl: cartridge.finalUrl,
            contentType: cartridge.contentType,
            ...summarizeCartridge(cartridge.buffer),
          }
        : null,
    },
    sourceVerification: {
      status: page.ok ? "verified" : "page-fetch-failed",
      verifiedAt,
      parserVersion,
      copyPolicy,
    },
  };
}

async function main() {
  const verifiedAt = new Date().toISOString();
  const courses = [];

  for (const course of VIRGINIA_AC_CTE_COURSES) {
    process.stdout.write(`Verifying ${course.key}... `);
    const record = await buildOfficialCourseRecord(course, verifiedAt);
    courses.push(record);
    console.log(record.sourceVerification.status);
  }

  const manifest = {
    meta: {
      source: "Virginia CTE Resource Center - Architecture & Construction Career Cluster",
      sourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/",
      jurisdiction: "VA",
      cluster: "Architecture & Construction",
      generatedAt: verifiedAt,
      parserVersion,
      copyPolicy,
      officialCourseCount: courses.filter((course) => !course.proposedTrack).length,
      proposedCourseCount: courses.filter((course) => course.proposedTrack).length,
      courseCount: courses.length,
    },
    courses,
  };

  await fs.mkdir(path.dirname(publicManifestPath), { recursive: true });
  await fs.writeFile(publicManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const moduleSource = `// Generated by scripts/generate-vdoe-cte-source-manifest.mjs. Do not edit by hand.\nexport const VDOE_CTE_SOURCE_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n\nexport const VDOE_CTE_SOURCE_COURSES_BY_KEY = Object.freeze(\n  Object.fromEntries((VDOE_CTE_SOURCE_MANIFEST.courses || []).map((course) => [course.key, course])),\n);\n`;
  await fs.writeFile(sourceModulePath, moduleSource, "utf8");

  console.log(`Wrote ${path.relative(root, publicManifestPath)} and ${path.relative(root, sourceModulePath)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});