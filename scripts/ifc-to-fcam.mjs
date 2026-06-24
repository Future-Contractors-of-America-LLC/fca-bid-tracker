#!/usr/bin/env node
/**
 * FCA sovereign IFC ingest — web-ifc geometry → FCAM JSON + optional GLB view cache.
 * Usage: node ifc-to-fcam.mjs --input path/to/model.ifc --output-fcam out.fcam.json [--output-glb out.glb]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as WebIFC from "web-ifc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { input: "", outputFcam: "", outputGlb: "", projectId: "project", fileId: "file", fileName: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--input") args.input = argv[++index] || "";
    else if (token === "--output-fcam") args.outputFcam = argv[++index] || "";
    else if (token === "--output-glb") args.outputGlb = argv[++index] || "";
    else if (token === "--project-id") args.projectId = argv[++index] || args.projectId;
    else if (token === "--file-id") args.fileId = argv[++index] || args.fileId;
    else if (token === "--file-name") args.fileName = argv[++index] || args.fileName;
  }
  return args;
}

function boundsFromVertices(verts) {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let index = 0; index < verts.length; index += 3) {
    const x = verts[index];
    const y = verts[index + 1];
    const z = verts[index + 2];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }
  if (!Number.isFinite(minX)) {
    return { min: [0, 0, 0], max: [1, 1, 1], center: [0.5, 0.5, 0.5], scale: [1, 1, 1] };
  }
  const center = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
  const scale = [Math.max(maxX - minX, 0.01), Math.max(maxY - minY, 0.01), Math.max(maxZ - minZ, 0.01)];
  return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ], center, scale };
}

function colorForIndex(index) {
  const palette = [
    [0.72, 0.72, 0.75],
    [0.62, 0.64, 0.68],
    [0.55, 0.57, 0.62],
    [0.76, 0.45, 0.2],
    [0.45, 0.65, 0.9],
  ];
  return palette[index % palette.length];
}

function buildGlbFromMeshes(meshes) {
  const positions = [];
  const colors = [];
  const indices = [];
  let vertexOffset = 0;

  meshes.forEach((mesh, meshIndex) => {
    const color = mesh.color || colorForIndex(meshIndex);
    const baseIndex = positions.length / 3;
    for (let index = 0; index < mesh.vertices.length; index += 3) {
      positions.push(mesh.vertices[index], mesh.vertices[index + 1], mesh.vertices[index + 2]);
      colors.push(color[0], color[1], color[2]);
    }
    mesh.indices.forEach((value) => indices.push(value + vertexOffset));
    vertexOffset += mesh.vertices.length / 3;
  });

  if (!positions.length) {
    return null;
  }

  const positionBytes = Buffer.from(new Float32Array(positions).buffer);
  const colorBytes = Buffer.from(new Float32Array(colors).buffer);
  const indexBytes = Buffer.from(new Uint16Array(indices).buffer);
  let binBlob = Buffer.concat([positionBytes, colorBytes, indexBytes]);
  while (binBlob.length % 4 !== 0) binBlob = Buffer.concat([binBlob, Buffer.from([0])]);

  const positionByteLength = positionBytes.length;
  const colorByteLength = colorBytes.length;
  const indexByteOffset = positionByteLength + colorByteLength;

  const gltf = {
    asset: { version: "2.0", generator: "FCA web-ifc ingest" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "FCAWebIfcMesh" }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, COLOR_0: 1 }, indices: 2, mode: 4 }] }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: positions.length / 3,
        type: "VEC3",
        min: [Math.min(...positions.filter((_, i) => i % 3 === 0)), Math.min(...positions.filter((_, i) => i % 3 === 1)), Math.min(...positions.filter((_, i) => i % 3 === 2))],
        max: [Math.max(...positions.filter((_, i) => i % 3 === 0)), Math.max(...positions.filter((_, i) => i % 3 === 1)), Math.max(...positions.filter((_, i) => i % 3 === 2))],
      },
      { bufferView: 1, componentType: 5126, count: colors.length / 3, type: "VEC3" },
      { bufferView: 2, componentType: 5123, count: indices.length, type: "SCALAR" },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positionByteLength, target: 34962 },
      { buffer: 0, byteOffset: positionByteLength, byteLength: colorByteLength, target: 34962 },
      { buffer: 0, byteOffset: indexByteOffset, byteLength: indexBytes.length, target: 34963 },
    ],
    buffers: [{ byteLength: binBlob.length }],
  };

  let jsonChunk = Buffer.from(JSON.stringify(gltf));
  while (jsonChunk.length % 4 !== 0) jsonChunk = Buffer.concat([jsonChunk, Buffer.from([0x20])]);

  const totalLength = 12 + 8 + jsonChunk.length + 8 + binBlob.length;
  const header = Buffer.alloc(12);
  header.write("glTF", 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);
  const jsonHeader = Buffer.alloc(8 + jsonChunk.length);
  jsonHeader.writeUInt32LE(jsonChunk.length, 0);
  jsonHeader.write("JSON", 4);
  jsonChunk.copy(jsonHeader, 8);
  const binHeader = Buffer.alloc(8 + binBlob.length);
  binHeader.writeUInt32LE(binBlob.length, 0);
  binHeader.write("BIN\0", 4);
  binBlob.copy(binHeader, 8);
  return Buffer.concat([header, jsonHeader, binHeader]);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.outputFcam) {
    console.error("Usage: node ifc-to-fcam.mjs --input model.ifc --output-fcam out.json [--output-glb out.glb]");
    process.exit(2);
  }

  const wasmPath = path.join(__dirname, "..", "node_modules", "web-ifc");
  const ifcApi = new WebIFC.IfcAPI();
  ifcApi.SetWasmPath(wasmPath + path.sep);
  await ifcApi.Init();

  const buffer = new Uint8Array(fs.readFileSync(args.input));
  const modelId = ifcApi.OpenModel(buffer);

  const elements = [];
  const glbMeshes = [];
  let meshIndex = 0;

  ifcApi.StreamAllMeshes(modelId, (flatMesh) => {
    const placed = flatMesh.geometries;
    for (let index = 0; index < placed.size(); index += 1) {
      const placedGeometry = placed.get(index);
      const verts = ifcApi.GetVertexArray(placedGeometry.geometryExpressID, modelId);
      const meshIndices = ifcApi.GetIndexArray(placedGeometry.geometryExpressID, modelId);
      const bounds = boundsFromVertices(verts);
      const color = placedGeometry.color
        ? [placedGeometry.color.x, placedGeometry.color.y, placedGeometry.color.z]
        : colorForIndex(meshIndex);

      elements.push({
        id: `elm-${String(meshIndex + 1).padStart(3, "0")}`,
        type: "IFCELEMENT",
        label: `IFC Mesh ${meshIndex + 1}`,
        geometry: {
          kind: "mesh-bounds",
          position: bounds.center,
          scale: bounds.scale,
          rotation: [0, 0, 0],
          expressId: placedGeometry.geometryExpressID,
        },
        color,
        properties: { ingestEngine: "web-ifc", vertexCount: verts.length / 3 },
      });

      glbMeshes.push({ vertices: Array.from(verts), indices: Array.from(meshIndices), color });
      meshIndex += 1;
    }
  });

  ifcApi.CloseModel(modelId);

  const fcamDocument = {
    $schema: "https://futurecontractorsofamerica.com/schemas/fcam/1.0",
    format: "FCAM",
    version: "1.0",
    fcaNative: true,
    projectId: args.projectId,
    fileId: args.fileId,
    elements,
    importProvenance: {
      externalFormat: "ifc",
      adapter: "fca-web-ifc-ingest",
      fileName: args.fileName || path.basename(args.input),
      note: "Full mesh geometry extracted via bundled web-ifc — external IFC is evidence only.",
    },
    metadata: {
      elementCount: elements.length,
      ingestEngine: "web-ifc",
    },
  };

  fs.writeFileSync(args.outputFcam, JSON.stringify(fcamDocument, null, 2));

  if (args.outputGlb && glbMeshes.length) {
    const glb = buildGlbFromMeshes(glbMeshes);
    if (glb) fs.writeFileSync(args.outputGlb, glb);
  }

  process.stdout.write(JSON.stringify({ ok: true, elementCount: elements.length, engine: "web-ifc" }));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
