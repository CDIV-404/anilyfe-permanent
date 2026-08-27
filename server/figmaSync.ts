import { timingSafeEqual } from "node:crypto";
import { storagePut } from "./storage";

type FigmaImageResponse = { images?: Record<string, string | null>; err?: string };
type Env = NodeJS.ProcessEnv;

export type FigmaSyncConfig = { token: string; fileKey: string; nodeIds: string[] };

export function parseFigmaNodeIds(value?: string): string[] {
  return (value ?? "").split(",").map((nodeId) => nodeId.trim()).filter(Boolean);
}

export function getFigmaSyncConfig(env: Env = process.env): FigmaSyncConfig {
  const token = env.FIGMA_TOKEN;
  const fileKey = env.FIGMA_FILE_KEY;
  const nodeIds = parseFigmaNodeIds(env.FIGMA_NODE_IDS);
  if (!token || !fileKey || nodeIds.length === 0) {
    throw new Error("Figma sync requires FIGMA_TOKEN, FIGMA_FILE_KEY, and FIGMA_NODE_IDS.");
  }
  return { token, fileKey, nodeIds };
}

export function hasFigmaSyncConfiguration(env: Env = process.env): boolean {
  try { getFigmaSyncConfig(env); return true; } catch { return false; }
}

export function isValidWebhookPasscode(received: unknown, expected = process.env.FIGMA_WEBHOOK_PASSCODE): boolean {
  if (typeof received !== "string" || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

function outputName(nodeId: string) { return nodeId.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase(); }

export async function exportFigmaNodes() {
  const { token, fileKey, nodeIds } = getFigmaSyncConfig();
  const endpoint = new URL(`/v1/images/${fileKey}`, "https://api.figma.com");
  endpoint.searchParams.set("ids", nodeIds.join(","));
  endpoint.searchParams.set("format", "svg");
  endpoint.searchParams.set("use_absolute_bounds", "true");
  const exportResponse = await fetch(endpoint, { headers: { "X-Figma-Token": token } });
  if (!exportResponse.ok) throw new Error(`Figma export request failed with HTTP ${exportResponse.status}.`);
  const body = await exportResponse.json() as FigmaImageResponse;
  if (!body.images) throw new Error(body.err || "Figma returned no export images.");

  const assets: Array<{ nodeId: string; key: string; url: string }> = [];
  for (const nodeId of nodeIds) {
    const sourceUrl = body.images[nodeId];
    if (!sourceUrl) continue;
    const assetResponse = await fetch(sourceUrl);
    if (!assetResponse.ok) throw new Error(`Unable to download Figma node ${nodeId}.`);
    const { key, url } = await storagePut(
      `figma/generated/${outputName(nodeId)}.svg`,
      new Uint8Array(await assetResponse.arrayBuffer()),
      "image/svg+xml",
    );
    assets.push({ nodeId, key, url });
  }

  const manifest = { fileKey, exportedAt: new Date().toISOString(), assets };
  const manifestAsset = await storagePut("figma/generated/manifest.json", JSON.stringify(manifest, null, 2), "application/json");
  return { ...manifest, manifestUrl: manifestAsset.url };
}

export async function dispatchGitHubFigmaSync(payload: Record<string, unknown>) {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token || !repository) return { dispatched: false as const };
  const response = await fetch(`https://api.github.com/repos/${repository}/dispatches`, {
    method: "POST",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
    body: JSON.stringify({ event_type: "figma-export-complete", client_payload: payload }),
  });
  if (!response.ok) throw new Error(`GitHub dispatch failed with HTTP ${response.status}.`);
  return { dispatched: true as const };
}
