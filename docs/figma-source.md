# Anilyfe Figma source

The permanent Anilyfe website now has a standard Figma Design file created in the connected Figma workspace.

| Field | Value |
|---|---|
| File URL | `https://www.figma.com/design/r9AbJ6TEiPnCQCouvNvGOb/Anilyfe-%E2%80%94-Permanent-Website` |
| File key | `r9AbJ6TEiPnCQCouvNvGOb` |
| Current status | Standard Figma Design file named **Anilyfe — Permanent Website**. The Figma command menu exposes file import for `.sketch` files; the prepared SVG frames must be added through canvas drag-and-drop, paste, or the included plugin workflow. |
| Server authentication | `FIGMA_TOKEN` is stored as a secure server-side secret and validated against Figma. |

The file key is not a credential. Do not commit tokens, webhooks passcodes, or OAuth secrets to this repository.

## Import note

The browser blocks direct cross-origin fetching of the website storage SVGs from within `figma.com`, so an SVG cannot be copied into the Figma canvas through browser JavaScript. Use the repository’s development plugin or Figma’s local canvas import/paste workflow to create native Figma layers. The permanent website itself is not affected because its asset requests occur from the site origin.

The new Figma source file is saved in the connected workspace and has been renamed **Anilyfe — Permanent Website**. The remaining content-import step is intentionally left to the plugin/local import workflow rather than placing the server token or temporary asset URL inside Figma.
