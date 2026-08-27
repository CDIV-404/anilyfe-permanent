# Anilyfe standalone 3D storefront

The permanent Anilyfe site is now a self-contained React/Vite storefront. Its visual system lives in the website source and its generated product imagery and GLB models are served from durable project storage rather than bundled into the application.

The homepage lazy-loads its Three.js viewer only when the hero reaches the browser. Each top-level category has a corresponding GLB model URL in `client/src/lib/anilyfeAssets.ts`. The viewer supports drag rotation, scroll zoom, responsive sizing, and a reduced-motion mode that disables automatic orbit and bobbing.

For local development, open the project in VS Code, install dependencies with `pnpm install`, and run `pnpm dev`. For a production validation pass, run `pnpm test`, `pnpm check`, and `pnpm build`. The website does not require a Figma token, a Figma file, webhooks, or a separate always-on synchronization service.

The private source repository is available at [github.com/CDIV-404/anilyfe-permanent](https://github.com/CDIV-404/anilyfe-permanent). The current deployment can be published from the project management interface after a checkpoint is saved.
