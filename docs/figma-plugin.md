# Build the native Anilyfe Figma source board

The local development plugin at `figma-plugin/manifest.json` creates the permanent Anilyfe source board directly inside the standard Figma file. It adds editable layout structure, typography, color blocks, hero copy, category tiles, and the 3D viewer’s intended placement. It does not copy the private Figma token or embed GLB models.

Open **Figma Design**, select **Plugins → Development → Import plugin from manifest…**, and choose `figma-plugin/manifest.json` from this project. Then select **Plugins → Development → Anilyfe Website Source Builder**. The plugin creates one native frame named `Anilyfe / Permanent Website / Design Source`.

Use Figma’s image fill controls to add visual references where desired. The permanent website continues to load the generated artwork and GLB models from durable project storage; Figma controls their visual placement and 2D export assets rather than rendering live GLB files.
