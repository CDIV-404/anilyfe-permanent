# Buyer shopping experience

## Purpose

This phase extends the public Anilyfe marketplace without adding payment collection, checkout, payouts, fulfillment, or inventory reservation. Buyers can discover products, inspect a product detail, save products locally, build a local cart, and contact an approved seller from a product detail. Seller and administrator controls remain separate protected workspaces.

## Information architecture

| Surface | Buyer capability | Data source and behavior |
|---|---|---|
| Marketplace | Search published products by text and filter by category. | Public published-product query. Preview cards remain clearly labelled when no approved live products exist. |
| Product detail | Inspect product image, seller, price, category, description, and availability. | Public product-by-ID query for published listings; a route-local preview is used only for labelled marketplace demonstration cards. |
| Saved items | Save or remove product cards for later comparison. | Browser-local state only; no buyer profile data is created or exposed. |
| Cart | Add, change quantity, remove, and review selected products. | Browser-local state only; the cart expressly stops before checkout and does not collect payment details. |
| Seller contact | Send a question about an approved live product. | Existing protected buyer-contact mutation; a signed-in buyer can contact the product’s seller. |

## Interaction rules

Search uses a URL query so results can be shared and refreshed. Search and category filters affect only public products with `published` status. Local saved items and cart lines use a stable display key and retain a compact display snapshot so they remain useful during a browser session. When a user attempts a protected seller-contact action, the account-entry flow is used instead of a shared demo credential.

Product cards must offer an obvious route to the detail page. Cards may also include a save control and an add-to-cart control. Saved and cart panels are accessible overlays using the provided UI sheet component. They include labelled controls, keyboard-safe focus behavior, clear empty states, and a “checkout is not enabled” message.

## Responsive behavior

At desktop width, buyer discovery can remain within the marketplace’s three-column structure. At mobile width, product grids stack, filter controls wrap or become a compact control row, and saved/cart panels remain usable with screen-width overlay content. No shopping action may obstruct account access, Seller Center, or Administrator Controls.

## Preview confirmation

The desktop buyer catalog and preview product-detail routes were checked after implementation. The catalog shows search and category controls, clear preview labels, detail routes, save controls, and add-to-cart controls without disturbing the existing marketplace header. The product-detail layout shows the selected item, price, seller context, save and cart actions, a clear preview notice, and the retained route to the home-page 3D viewer.

The same catalog and product detail were reviewed at a 390-pixel mobile viewport. The filter row wrapped within its panel, product cards stacked cleanly, and saved/cart actions retained visible labels and adequate touch targets. TypeScript validation, the twelve-test Vitest suite, and the production build passed. The final browser-console review contained no new error entries. Production bundling still reports an advisory main-chunk size warning because the marketplace workspace remains in the client application bundle; the independent Three.js viewer is still lazy-loaded.
