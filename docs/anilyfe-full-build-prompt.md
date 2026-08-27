# Full Anilyfe build prompt — no Figma

Build **Anilyfe**, a permanent, responsive anime marketplace and community web application. Use **React with TypeScript, HTML/JSX, CSS, JavaScript where required, and Tailwind CSS** for most layout and interface styling. The application must be production-oriented, accessible, and usable on desktop and mobile. **Do not use Figma at any point.** Do not create Figma files, plugins, webhooks, sync systems, API integrations, exports, or Figma-related documentation. The website code and its durable media assets are the single source of truth.

## Visual source of truth

Use the supplied marketplace reference image as the design source of truth. Recreate its **light, polished marketplace dashboard composition** rather than a dark cyberpunk landing page. Match the hierarchy and layout closely while retaining Anilyfe’s own branding and original visual assets:

| Area | Required treatment |
|---|---|
| Utility header | Anilyfe wordmark with a gold kunai replacing the “I”, broad product search field, category selector, search button, Wishlist, Cart, Notifications, and account menu. |
| Main navigation | A blue “Browse Categories” control followed by Home, Marketplace, Digital Products, Physical Products, New Arrivals, Trending, and Community links. |
| Left rail | Category navigation, a “Become a Seller” callout, and concise buyer/seller trust and support information. |
| Center column | Original anime hero visual, clear “ANIL YFE”/Anilyfe headline treatment, Shop Now and Join Community actions, circular category shortcuts, featured-product grid, and interactive 3D product section. |
| Right rail | Hot Deals card, compact count-down display, product promotion, Community card, and Seller Center entry. |
| Visual direction | White and very pale blue surfaces, navy copy, Anilyfe blue primary actions, restrained gold accent, thin gray-blue borders, soft card shadows, clean rounded corners, and professional ecommerce spacing. |

Create original, high-quality artwork where needed. Generate a wide blue-and-gold anime-inspired hero with an original silhouetted character on the right and clear text-safe space on the left. Generate original product imagery for figures, apparel, art prints, manga/box sets, and digital packs. Do **not** use copyrighted anime characters, franchise artwork, logos, or copied product images. Do not manufacture reviews, ratings, testimonials, seller counts, or customer activity; omit those until real data exists.

## Brand and motion

Use a custom **ANIL[YFE]** wordmark treatment with a kunai-shaped “I”. Give the logo a tasteful entrance animation on first load, but respect `prefers-reduced-motion`. Preserve visible keyboard focus states, useful labels, semantic HTML, adequate color contrast, and mobile-friendly tap targets. Keep nonessential interface motion subtle, short, and interruptible.

## Marketplace categories and 3D experience

Support these top-level marketplace categories and give each a clear category treatment plus nested subcategories:

| Top-level category | Example nested subcategories |
|---|---|
| Figures & Collectibles | Original heroes, mecha & robots, limited editions |
| Clothing & Apparel | Streetwear, team jerseys, soft layers |
| Manga & Books | Box sets, art books, light novels |
| Accessories | Keychains, jewellery, desk finds |
| Posters & Wall Art | Hobby posters, wall art, framed prints |
| Digital Products | Wallpapers, sound packs, creator tools |
| Home & Living | Mugs, desk mats, textiles |
| Cosplay | Cloaks, armor, wigs and props |

Preserve true **Three.js** support with an interactive GLB/GLTF viewer. Every top-level category must map to a real model. The model viewer must lazy-load, allow drag rotation and scroll/pinch zoom, use robust cleanup when models change, and use frame-rate-independent animation. It must disable auto-rotation and bobbing when reduced motion is enabled. Present it in the new light marketplace UI as a compact but prominent interactive product preview instead of removing it.

## Accounts and buyer experience

Create a dedicated **Create Account / Log In** page using the existing secure authentication flow. First-time users should receive a buyer account automatically after secure sign-in. Do not invent shared credentials, shared passwords, or an insecure demo login. Include a clearly labelled **Buyer Demo Area** that explains the buyer journey without exposing any private account:

1. Browse approved seller listings.
2. Ask a seller a question about a specific product.
3. Apply to open a seller shop when ready.

Buyers must be able to browse published products and send a protected customer message to a seller from a live product card or product detail context. Buyers can only access their own account data and messages.

## Seller Center

Create a secure **Seller Center** page. A signed-in user without a seller profile should see a seller application form with shop name, contact email, and short shop bio. New sellers must remain in `pending` status until approved by an administrator.

Approved sellers must be able to:

- Create product listings with product name, description, category, price, and currency.
- Save a product as a draft or submit it for administrator review.
- Upload up to three PNG, JPEG, or WEBP product images, with useful size limits and feedback.
- Change existing product details and price after creation.
- Resubmit edited products for review.
- View their own product status: draft, submitted, published, or rejected.
- Receive and manage customer messages in a seller inbox.

Store image bytes in durable object storage and store only image metadata, storage keys, URLs, alternative text, and sort order in the database. Authorize seller ownership **before** any storage write. A seller must never be able to read, edit, attach images to, or view messages for another seller’s records.

## Administrator workspace

Create a secure **Admin** page for users with administrator role only. Non-admin accounts must receive a clear access-denied state and must not be able to call administrator API actions.

The admin workspace must provide:

- A seller approval queue showing pending applications.
- Approve and reject controls for sellers, with an optional review note.
- A product review queue showing submitted seller products.
- Publish and reject controls for product submissions, with an optional review note.
- Marketplace queue counters for pending sellers and submitted products.
- An announcement composer with title, body, publish/draft status, and optional pinning.
- Published announcements shown on the public marketplace near the top of the central content.

## Backend, permissions, and data model

Use the project’s existing React/Vite, Express, tRPC, authentication, database, and object-storage foundation. Use tRPC for application APIs; do not add ad-hoc REST clients. Use protected procedures for signed-in actions and an admin-only procedure for moderation actions.

Create database entities equivalent to the following:

| Entity | Core fields and rules |
|---|---|
| Seller profile | User owner, shop name, unique slug, bio, contact email, approval status, review note, reviewer, timestamps. |
| Marketplace product | Seller owner, name, description, category, decimal price, currency, draft/submitted/published/rejected status, review note, timestamps. |
| Product image | Product owner, durable storage key and URL, alternative text, sort order, timestamp. |
| Buyer contact | Product, buyer user, recipient seller, customer message, new/replied/closed status, timestamps. |
| Announcement | Admin author, title, body, draft/published status, pinned flag, publish timestamp. |

Enforce ownership at the database-helper and API layers. Public users may see only `published` products and `published` announcements. Buyers may create messages only for published products. Sellers may access only their own shop, products, product images, and recipient messages. Administrators may review queues and publish announcements. Keep all time values in UTC internally and display them in the viewer’s local time only when required.

## Media and performance rules

Do not place large images, videos, GLB files, or product media in `client/public` or `client/src/assets`. Keep source media outside the project directory and serve runtime media from durable `/manus-storage/` URLs. Keep the Three.js viewer code-split from the initial storefront bundle. Use responsive image containers, `loading="lazy"` where appropriate, correct alt text, and clean loading/error states.

## Responsive and implementation requirements

On desktop, show the three-column marketplace dashboard. On tablet and mobile, collapse this into a clear single-column flow with a compact account/menu header, useful search access, and no clipped cards or inaccessible controls. Do not use a generic admin dashboard shell for the public marketplace; use a bespoke commerce header and layout. The admin workspace may use dashboard-style navigation if helpful.

Use reusable components for the wordmark, marketplace header, category rail, product card, 3D preview, account entry, seller forms, moderation queues, and announcement form. Prefer Tailwind utilities for structure and use custom CSS only for focused reusable details, complex viewer styling, and reduced-motion behavior.

## Validation and delivery criteria

Before delivery, ensure the following are true:

- TypeScript validation passes.
- Unit tests cover category-to-model mapping, seller ownership, product-image ownership, buyer/seller message access, administrator-only actions, product price updates, invalid input rejection, and positive authorized image upload metadata persistence.
- The production build succeeds.
- Desktop and mobile screenshots show the public marketplace, Account page, Seller Center, and Admin workspace without layout problems.
- The initial GLB model loads and at least one category model switch works.
- The source is committed, checkpointed, and synchronized to the configured private GitHub repository.

This is currently a marketplace and moderation platform, not a payment system. Do not add payment processing, seller payouts, fulfillment, or real checkout until that scope is explicitly requested.
