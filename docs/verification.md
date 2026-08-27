# Permanent site verification

The desktop permanent-site preview loaded successfully with the default figure GLB. The 3D viewer announced **“GLB loaded. Drag to rotate and scroll to zoom.”** and the browser console reported no errors.

The desktop and mobile screenshots confirmed that the responsive editorial layout, product artwork served from object storage, the mobile layout, and the framed 3D viewer render. The standalone edition does not depend on Figma, Figma webhooks, or Figma token configuration.

The final validation suite passed with three tests across the asset manifest and authentication behavior, together with a clean TypeScript check and production build. The GLB viewer has been code-split from the primary storefront bundle and the active product model loaded correctly in the browser preview.

## Futuristic anime redesign validation

The homepage was rebuilt as a dark, neon anime-tech marketplace using React JSX, Tailwind utilities, and focused CSS only for the portal-grid, holographic, and reduced-motion details. The kunai wordmark, responsive navigation, eight category-to-GLB mappings, nested subcategories, and lazy-loaded interactive model viewer remain active.

The default figure GLB rendered in the refreshed desktop preview inside the cyan/violet holodeck. Browser-console entries recorded after the viewer cleanup improvement contained no new errors. The category preview uses a dedicated futuristic hero image plus four durable `/manus-storage/` collection-transmission image URLs, avoiding local media files in the application bundle.

Desktop and mobile screenshots confirmed the small-screen single-column flow, legible headline treatment, responsive 3D stage, category grid, and product-card layout. The implementation retains `prefers-reduced-motion` controls: non-essential CSS motion is disabled and the Three.js object does not auto-rotate or bob when the preference is active.

On 2026-08-27, `pnpm check`, `pnpm test`, and `pnpm build` all passed. The production build continues to report advisory chunk-size warnings for the existing primary client bundle and lazy Three.js viewer bundle; they do not block the build and the Three.js viewer remains loaded separately from the initial page route.

## Reference-matched marketplace and role workflows

On 2026-08-27, the public homepage was rebuilt around the supplied light marketplace reference: a two-tier product-search header, category rail, hero, circular category shortcuts, five-card product row, deal module, community and seller modules, and an interactive GLB preview. The layout was inspected at desktop and 390-pixel mobile widths, alongside the responsive Account, Seller Center, and Administrator Controls pages.

The project now persists seller profiles, product listings, product-image metadata, buyer contacts, and administrator announcements. Seller images are authorized before the server writes their bytes to durable object storage. Server tests cover seller product and product-image ownership, seller contact ownership, and denial of all administrator review/announcement operations to a buyer-role account.

The seller workflow includes an approval gate, product name/description/category/price entry, product-image upload, draft or submission status, inbox status changes, and an existing-listing editor that resubmits changed prices or details for review. The administrator workflow exposes seller and product approval queues plus announcement publishing. `pnpm check`, ten Vitest tests, and `pnpm build` passed after the latest seller-editor change; the suite verifies malformed listing data and undersized image payloads are rejected before an action can reach storage, an owning approved seller can change a price before resubmitting the listing, and a valid seller upload is authorized before `storagePut` runs and persists only the returned storage key/URL metadata. Bundle-size warnings remain advisory only.
