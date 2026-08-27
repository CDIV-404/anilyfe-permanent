# Anilyfe marketplace architecture

The supplied reference is the layout source of truth for the new public storefront: a light marketplace workspace rather than a dark editorial landing page. The responsive implementation will retain Anilyfe’s kunai wordmark and real Three.js product-preview capability, but organize the desktop view into a utility header, category rail, central hero and product feed, and a right-hand deals/community/seller rail.

| Area | Desktop reference treatment | Responsive treatment |
|---|---|---|
| Header | Wordmark, product search, category filter, Wishlist, Cart, Notifications, and account entry. | Collapsed search and a menu trigger; account remains reachable. |
| Left rail | Browse Categories, a seller callout, and marketplace trust signals. | Moves below the hero as an expandable category matrix. |
| Main content | Campaign hero, circular category shortcuts, product feed, and an optional live 3D preview panel. | Hero, category chips, product cards, and 3D panel stack vertically. |
| Right rail | Hot deal count-down, community invite, and seller directory. | Becomes concise modules after product content. |

## Account and role model

Authentication uses the project’s existing secure OAuth entry point. A single **Create account / Log in** page explains that first-time sign-in creates the buyer profile automatically. The buyer demo area will be a clearly marked interface walkthrough, not a shared password or fabricated user account.

| Role or status | Permissions |
|---|---|
| Buyer | Browse published products, submit customer messages to a seller, view the demo-account walkthrough, and apply to sell. |
| Pending seller | Complete a shop profile and create draft or submitted product listings. Products cannot be published until approval. |
| Approved seller | Upload product images, set product names, descriptions, categories, and prices, submit products for review, and manage received customer messages. |
| Administrator | Review seller applications, approve or reject products, publish announcements, and inspect marketplace queues. |

## Data ownership rules

Every seller profile, product, image, and customer message records its owner. Product image bytes live in object storage; the database stores only the image key, URL, alt text, and sort order. A seller may read and edit only their own records. Customer messages are visible to their buyer and the recipient seller; marketplace administrators can access approval queues and announcements only through admin-protected procedures.
