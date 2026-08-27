import type { Express } from "express";
import { dispatchGitHubFigmaSync, exportFigmaNodes, hasFigmaSyncConfiguration, isValidWebhookPasscode } from "./figmaSync";

export function registerFigmaWebhook(app: Express) {
  app.get("/api/integrations/figma/health", (_req, res) => {
    res.status(200).json({ service: "figma-sync", configured: hasFigmaSyncConfiguration() });
  });

  app.post("/api/webhooks/figma", async (req, res) => {
    if (!isValidWebhookPasscode(req.body?.passcode)) {
      res.status(400).json({ error: "Invalid Figma webhook passcode." });
      return;
    }
    if (!hasFigmaSyncConfiguration()) {
      res.status(503).json({ error: "Figma export configuration is incomplete." });
      return;
    }
    try {
      const exportResult = await exportFigmaNodes();
      const dispatchResult = await dispatchGitHubFigmaSync({ manifestUrl: exportResult.manifestUrl, exportedAt: exportResult.exportedAt });
      res.status(200).json({ ok: true, assetCount: exportResult.assets.length, manifestUrl: exportResult.manifestUrl, githubDispatched: dispatchResult.dispatched });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown export error.";
      console.error("[Figma sync] Export failed:", message);
      res.status(502).json({ error: "Figma export failed. Check the private server configuration." });
    }
  });
}
