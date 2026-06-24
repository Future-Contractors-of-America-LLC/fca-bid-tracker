#!/usr/bin/env node
/**
 * FCA PDF → FCAS raster tile pipeline using pdfjs-dist.
 * Usage: node pdf-to-fcas-tiles.mjs --input doc.pdf --output out.fcas.json [--tiles-dir dir]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = {
    input: "",
    output: "",
    tilesDir: "",
    projectId: "project",
    fileId: "file",
    fileName: "",
    maxPages: 12,
    scale: 1.5,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--input") args.input = argv[++index] || "";
    else if (token === "--output") args.output = argv[++index] || "";
    else if (token === "--tiles-dir") args.tilesDir = argv[++index] || "";
    else if (token === "--project-id") args.projectId = argv[++index] || args.projectId;
    else if (token === "--file-id") args.fileId = argv[++index] || args.fileId;
    else if (token === "--file-name") args.fileName = argv[++index] || args.fileName;
    else if (token === "--max-pages") args.maxPages = Number(argv[++index] || args.maxPages);
  }
  return args;
}

async function loadCanvasFactory() {
  try {
    const canvasModule = await import("@napi-rs/canvas");
    return canvasModule.createCanvas;
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.output) {
    console.error("Usage: node pdf-to-fcas-tiles.mjs --input doc.pdf --output out.fcas.json [--tiles-dir tiles/]");
    process.exit(2);
  }

  const createCanvas = await loadCanvasFactory();
  const data = new Uint8Array(fs.readFileSync(args.input));
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;
  const pageCount = Math.min(pdf.numPages, args.maxPages);
  const baseName = (args.fileName || path.basename(args.input)).replace(/\.pdf$/i, "");

  if (args.tilesDir) fs.mkdirSync(args.tilesDir, { recursive: true });

  const sheets = [];
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: args.scale });
    const width = Math.round(viewport.width);
    const height = Math.round(viewport.height);
    const sheet = {
      sheetId: `SHT-${String(pageNumber).padStart(3, "0")}`,
      name: `${baseName} — Page ${pageNumber}`,
      discipline: "General",
      width,
      height,
      scale: "As printed",
      pageIndex: pageNumber - 1,
      viewType: "sheet",
      tiles: [],
    };

    if (createCanvas && args.tilesDir) {
      const canvas = createCanvas(width, height);
      const context = canvas.getContext("2d");
      await page.render({ canvasContext: context, viewport }).promise;
      const pngPath = path.join(args.tilesDir, `page-${pageNumber}.png`);
      fs.writeFileSync(pngPath, canvas.toBuffer("image/png"));
      sheet.tiles.push({
        id: `tile-p${pageNumber}-z1`,
        zoomLevel: 1,
        width,
        height,
        mimeType: "image/png",
        localPath: pngPath,
        tileIndex: 0,
      });
    } else {
      sheet.tiles.push({
        id: `tile-p${pageNumber}-stream`,
        zoomLevel: 1,
        width,
        height,
        streamFallback: true,
        pageNumber,
        note: "Client renders from governed PDF stream when raster unavailable.",
      });
    }

    sheets.push(sheet);
  }

  const fcasDocument = {
    $schema: "https://futurecontractorsofamerica.com/schemas/fcas/1.0",
    format: "FCAS",
    version: "1.0",
    fcaNative: true,
    projectId: args.projectId,
    fileId: args.fileId,
    sheets,
    importProvenance: {
      externalFormat: "pdf",
      adapter: createCanvas ? "fca-pdfjs-raster-tiles" : "fca-pdfjs-dimensions",
      fileName: args.fileName || path.basename(args.input),
    },
    metadata: {
      pageCount,
      rasterEngine: createCanvas ? "pdfjs+canvas" : "pdfjs-dimensions",
    },
  };

  fs.writeFileSync(args.output, JSON.stringify(fcasDocument, null, 2));
  process.stdout.write(JSON.stringify({ ok: true, pageCount, raster: Boolean(createCanvas) }));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
