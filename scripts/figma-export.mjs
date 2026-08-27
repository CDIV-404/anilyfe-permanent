import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const { FIGMA_TOKEN, FIGMA_FILE_KEY, FIGMA_NODE_IDS } = process.env;
if (!FIGMA_TOKEN || !FIGMA_FILE_KEY || !FIGMA_NODE_IDS) throw new Error("Set FIGMA_TOKEN, FIGMA_FILE_KEY, and FIGMA_NODE_IDS as protected CI secrets.");
const nodeIds = FIGMA_NODE_IDS.split(",").map((item) => item.trim()).filter(Boolean);
const url = new URL(`https://api.figma.com/v1/images/${FIGMA_FILE_KEY}`);
url.searchParams.set("ids", nodeIds.join(","));
url.searchParams.set("format", "svg");
const response = await fetch(url, { headers: { "X-Figma-Token": FIGMA_TOKEN } });
if (!response.ok) throw new Error(`Figma returned HTTP ${response.status}.`);
const { images = {} } = await response.json();
const outputDir = path.resolve("figma-exports");
await mkdir(outputDir, { recursive: true });
const manifest = { fileKey: FIGMA_FILE_KEY, exportedAt: new Date().toISOString(), assets: [] };
for (const nodeId of nodeIds) {
  const imageUrl = images[nodeId];
  if (!imageUrl) continue;
  const asset = await fetch(imageUrl);
  if (!asset.ok) throw new Error(`Unable to fetch exported node ${nodeId}.`);
  const name = `${nodeId.replace(/[^a-z0-9]+/gi, "-")}.svg`.toLowerCase();
  await writeFile(path.join(outputDir, name), new Uint8Array(await asset.arrayBuffer()));
  manifest.assets.push({ nodeId, file: name });
}
await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
