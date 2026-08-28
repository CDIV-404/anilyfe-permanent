# Lively Anilyfe marketplace direction

## Visual system

The refreshed Anilyfe interface remains **white-and-blue**, but replaces plain flat sections with an immersive anime-futurist atmosphere. A deep ink-blue motion wallpaper sits behind the experience, layered with softly drifting light trails, glassy blue halos, restrained particles, and translucent technical grid lines. Content remains readable on white and frosted-blue glass surfaces, with cobalt and electric-blue used for primary actions, warm gold retained only for rare trust or pioneer signals, and dark navy providing typography contrast.

| Surface | Treatment | Motion and interaction |
|---|---|---|
| Site backdrop | Original blue-white anime energy art under a dim overlay, plus CSS light orbs and line patterns. | Slow transform-only drift, disabled for reduced motion. |
| Main marketplace panels | White panels with blue-tinted translucent borders, soft layered shadows, and selective `backdrop-filter` glass treatment. | Lift and blue edge glow on hover; controls respond within 160–220ms. |
| Hero and 3D stage | Cinematic hero glass with blue energy framing; 3D model display presented as a holographic product vault. | Ambient halo/pulse and existing timestamp-based 3D model motion, both reduced-motion aware. |
| Product cards | Bright frosted cards with depth, edge gradients, category ribbons, and a clearer seller identity. | Image/3D preview scale and card lift on hover; no layout-shifting animation. |
| Account and admin pages | A clean white information layer above a darker blue illustrated side panel. | Subtle entrance cascade only when motion is allowed. |

## Role governance

> **A first administrator cannot be claimed by public registration.** The primary administrator is initialized only for the project owner’s verified identity, then becomes the exclusive authority for approving or revoking other administrators and sellers.

| Capability | Buyer | Pending seller | Approved seller | Administrator | Primary administrator |
|---|---:|---:|---:|---:|---:|
| Browse, save, and prepare a cart | Yes | Yes | Yes | Yes | Yes |
| Submit and edit own products | No | Draft only | Yes | No | No |
| Receive buyer messages | No | No | Yes | No | No |
| Review products and post announcements | No | No | No | Yes | Yes |
| Add, suspend, badge, and remove sellers | No | No | No | No | Yes |
| Approve or revoke administrator accounts | No | No | No | No | Yes |
| Designate a replacement primary administrator | No | No | No | No | Owner-controlled transfer only |

The existing project-owner identity is automatically recognized as the bootstrap administrator. An administrator account request creates only a pending request. The primary administrator must explicitly approve it before the requester receives the `admin` role. This prevents the unsafe outcome where the first anonymous visitor could become the marketplace’s controlling administrator. There is intentionally no public primary-administrator transfer control.

## Seller identity and listings

Each seller receives a stable public identifier in the form `Seller001`, `Seller002`, and so on, derived from the seller profile sequence and preserved in the seller record. The primary administrator may assign `Trusted Seller` and `Pioneer Seller` badges. Seller listing forms retain image upload and product name, and now offer a limited currency selector for NGN, USD, GBP, and EUR rather than a free-text code. Pricing is displayed with the selected currency in the public marketplace. The dedicated primary-only Seller Identity Management page can add an approved seller profile only for an already-created user ID. It can also remove a seller profile only after the exact typed confirmation `REMOVE SELLER`; the UI explains that profile-linked marketplace records are removed while the user identity remains.

## Account entry and sign-out

New visitors see a full-screen account gateway before browsing the marketplace. They choose a buyer, seller, or administrator path, then continue through the project’s existing protected identity sign-in. Buyers arrive at their marketplace home, approved sellers arrive at Seller Center, and approved administrators arrive at Administrator Controls. A visible sign-out action clears the session using the existing secure server procedure and returns the visitor to `/account`. Internal post-login routes are persisted once in browser session storage, consumed after sign-in, and reject protocol-relative/external destinations. Seller applications remain pending until the primary administrator approves them.

## Desktop validation findings

The authenticated marketplace, Seller Center, Administrator Controls, and account gateway were visually inspected after the refresh. The marketplace now has a visible animated blue-white grid backdrop, translucent layered panels, hover-depth product cards, motion-aware hero accents, a holographic GLB vault, and a visible sign-out action. The current verified primary administrator sees governance authority, administrator-request handling, seller `Seller001` identity, trust-badge controls, suspension controls, product moderation, and community announcements. The seller form presents a limited currency selector and retained secure product-image upload area.

The generated blue-white anime-futurist wallpaper was then applied as the visible motion layer behind the authenticated storefront. It adds a cinematic energy texture to the otherwise white-and-blue marketplace without reducing text contrast or obscuring the practical product, category, and account controls.

At the mobile breakpoint, the protected administrator console stacks its primary-governance panel, seller controls, site-section studio, and announcement form into readable touch-sized modules. Seller Center preserves the Seller ID, badges, category and currency selectors, product upload zone, and submission actions without horizontal overflow. The Seller Identity Management form and removal action also stack into touch-sized modules. The account gateway retains distinct user and administrator choices with the role-security notice intact. Continuous CSS motion and Three.js auto-rotation/model bobbing are disabled when reduced motion is requested.
