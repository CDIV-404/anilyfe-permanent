# Figma, storage, and GitHub synchronization

The permanent site uses `/manus-storage/` URLs for live images, Figma exports, and GLB models. This prevents large media from being bundled into the React application and keeps the production asset paths stable.

| Layer | Responsibility | Status |
|---|---|---|
| Figma Design | Visual source and selected export frames | File created: **Anilyfe — Permanent Website** |
| Permanent server | Secures the token, validates webhook passcodes, exports selected SVGs, and uploads them to object storage | Implemented; requires file key, node IDs, and passcode |
| Website | References durable image and GLB URLs, then uses Three.js to render GLB models | Implemented |
| GitHub Action | Re-exports chosen Figma frames on demand or repository dispatch and commits the source export record | Implemented; requires GitHub secrets |

## Activate the Figma sync

Add the following server-side values through the project secrets panel: `FIGMA_FILE_KEY`, `FIGMA_NODE_IDS`, and `FIGMA_WEBHOOK_PASSCODE`. The `FIGMA_TOKEN` is already stored securely. Node IDs should refer to the desktop homepage, mobile homepage, and design-system frames after they are added to the Figma Design file.

Create a Figma file webhook that posts to `https://<published-domain>/api/webhooks/figma` and use the same random passcode in Figma and the server secret. The receiver rejects mismatched passcodes and stores the exported SVGs in durable object storage. Configure `GITHUB_DISPATCH_TOKEN` and `GITHUB_REPOSITORY` only if the webhook should also dispatch the GitHub workflow.

The GitHub workflow keeps a versioned `figma-exports/` source record. It does not serve runtime assets; the website continues to use project storage URLs.

Figma’s REST API supports image exports for selected node IDs, and its webhook system can notify an HTTPS receiver about supported file events.[1] [2]

## References

[1]: https://developers.figma.com/docs/rest-api/file-endpoints/ "Figma file and image endpoints"
[2]: https://developers.figma.com/docs/rest-api/webhooks/ "Figma webhooks"
