import { and, desc, eq, like, or } from "drizzle-orm";
import { adminRequests, announcements, buyerContacts, marketplaceGovernance, marketplaceProducts, productImages, sellerBadges, sellerProfiles, siteSections, users } from "../drizzle/schema";
import { getDb } from "./db";
import { ENV } from "./_core/env";

export const MARKETPLACE_CATEGORIES = ["figures", "clothing", "manga", "accessories", "posters", "digital", "home", "cosplay"] as const;
export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];
export const SUPPORTED_CURRENCIES = ["NGN", "USD", "GBP", "EUR"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export type SellerStatus = "pending" | "approved" | "rejected" | "suspended";
export type ProductStatus = "draft" | "submitted" | "published" | "rejected";
export type ContactStatus = "new" | "replied" | "closed";
export type SellerBadgeName = "trusted" | "pioneer";
export type AdminRequestStatus = "pending" | "approved" | "rejected" | "revoked";
export type SiteSectionType = "banner" | "community" | "collection" | "notice";
export type SiteSectionStatus = "draft" | "published";

async function database() {
  const db = await getDb();
  if (!db) throw new Error("Marketplace database is unavailable.");
  return db;
}

export async function getSellerProfileForUser(userId: number) {
  const db = await database();
  const [seller] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId)).limit(1);
  return seller ?? null;
}

export async function createSellerProfile(input: { userId: number; shopName: string; shopSlug: string; bio?: string; contactEmail?: string }) {
  const db = await database();
  const existing = await getSellerProfileForUser(input.userId);
  if (existing) throw new Error("A seller application already exists for this account.");
  const created = await db.insert(sellerProfiles).values({ ...input, status: "pending" });
  const sellerId = Number(created[0].insertId);
  await db.update(sellerProfiles).set({ sellerCode: `Seller${String(sellerId).padStart(3, "0")}` }).where(eq(sellerProfiles.id, sellerId));
  return getSellerProfileForUser(input.userId);
}

async function requireApprovedSeller(userId: number) {
  const seller = await getSellerProfileForUser(userId);
  if (!seller) throw new Error("Create a seller profile before managing products.");
  if (seller.status !== "approved") throw new Error("Seller approval is required before managing product listings.");
  return seller;
}

async function requireOwnedProduct(userId: number, productId: number) {
  const db = await database();
  const seller = await requireApprovedSeller(userId);
  const [product] = await db.select().from(marketplaceProducts).where(and(eq(marketplaceProducts.id, productId), eq(marketplaceProducts.sellerId, seller.id))).limit(1);
  if (!product) throw new Error("You can manage only products that belong to your approved seller profile.");
  return { db, seller, product };
}

export async function assertSellerOwnsProduct(userId: number, productId: number) {
  await requireOwnedProduct(userId, productId);
}

export async function listSellerProducts(userId: number) {
  const db = await database();
  const seller = await getSellerProfileForUser(userId);
  if (!seller) return { seller: null, products: [], images: [], badges: [] };
  const products = await db.select().from(marketplaceProducts).where(eq(marketplaceProducts.sellerId, seller.id)).orderBy(desc(marketplaceProducts.updatedAt));
  const productIds = products.map((product) => product.id);
  const images = productIds.length ? await Promise.all(productIds.map((productId) => db.select().from(productImages).where(eq(productImages.productId, productId)))).then((rows) => rows.flat()) : [];
  const badges = await db.select().from(sellerBadges).where(eq(sellerBadges.sellerId, seller.id));
  return { seller, products, images, badges };
}

export async function createSellerProduct(userId: number, input: { name: string; description: string; category: MarketplaceCategory; price: string; currency: SupportedCurrency; status: "draft" | "submitted" }) {
  const db = await database();
  const seller = await requireApprovedSeller(userId);
  const result = await db.insert(marketplaceProducts).values({ sellerId: seller.id, ...input });
  const productId = Number(result[0].insertId);
  const [product] = await db.select().from(marketplaceProducts).where(eq(marketplaceProducts.id, productId)).limit(1);
  return product;
}

export async function updateSellerProduct(userId: number, productId: number, input: { name: string; description: string; category: MarketplaceCategory; price: string; currency: SupportedCurrency; status: "draft" | "submitted" }) {
  const { db } = await requireOwnedProduct(userId, productId);
  await db.update(marketplaceProducts).set({ ...input, reviewNote: null }).where(eq(marketplaceProducts.id, productId));
  const [product] = await db.select().from(marketplaceProducts).where(eq(marketplaceProducts.id, productId)).limit(1);
  return product;
}

export async function addProductImageForSeller(userId: number, productId: number, input: { storageKey: string; imageUrl: string; altText?: string; sortOrder: number }) {
  const { db } = await requireOwnedProduct(userId, productId);
  const result = await db.insert(productImages).values({ productId, ...input });
  const imageId = Number(result[0].insertId);
  const [image] = await db.select().from(productImages).where(eq(productImages.id, imageId)).limit(1);
  return image;
}

type PublishedProductRow = { product: typeof marketplaceProducts.$inferSelect; seller: typeof sellerProfiles.$inferSelect; image: typeof productImages.$inferSelect | null };

function serializePublishedProducts(rows: PublishedProductRow[]) {
  const grouped = new Map<number, { product: typeof marketplaceProducts.$inferSelect; sellerName: string; sellerSlug: string; productImages: Array<typeof productImages.$inferSelect> }>();
  for (const { product, seller, image } of rows) {
    const existing = grouped.get(product.id) ?? { product, sellerName: seller.shopName, sellerSlug: seller.shopSlug, productImages: [] };
    if (image) existing.productImages.push(image);
    grouped.set(product.id, existing);
  }
  return Array.from(grouped.values()).map(({ product, sellerName, sellerSlug, productImages: images }) => {
    const productImages = [...images].sort((first, second) => first.sortOrder - second.sortOrder);
    return { ...product, sellerName, sellerSlug, imageUrl: productImages[0]?.imageUrl ?? null, productImages };
  });
}

export async function listPublishedProducts(input: { category?: MarketplaceCategory; search?: string } = {}) {
  const db = await database();
  const conditions = [eq(marketplaceProducts.status, "published")];
  if (input.category) conditions.push(eq(marketplaceProducts.category, input.category));
  if (input.search) {
    const searchTerm = `%${input.search}%`;
    conditions.push(or(like(marketplaceProducts.name, searchTerm), like(marketplaceProducts.description, searchTerm))!);
  }
  const where = conditions.length === 1 ? conditions[0]! : and(...conditions);
  const rows = await db.select({ product: marketplaceProducts, seller: sellerProfiles, image: productImages }).from(marketplaceProducts).innerJoin(sellerProfiles, eq(marketplaceProducts.sellerId, sellerProfiles.id)).leftJoin(productImages, eq(productImages.productId, marketplaceProducts.id)).where(and(where, eq(sellerProfiles.status, "approved"))).orderBy(desc(marketplaceProducts.publishedAt));
  return serializePublishedProducts(rows);
}

export async function getPublishedProduct(productId: number) {
  const db = await database();
  const rows = await db.select({ product: marketplaceProducts, seller: sellerProfiles, image: productImages }).from(marketplaceProducts).innerJoin(sellerProfiles, eq(marketplaceProducts.sellerId, sellerProfiles.id)).leftJoin(productImages, eq(productImages.productId, marketplaceProducts.id)).where(and(eq(marketplaceProducts.id, productId), eq(marketplaceProducts.status, "published"), eq(sellerProfiles.status, "approved")));
  return serializePublishedProducts(rows)[0] ?? null;
}

export async function createBuyerContact(userId: number, input: { productId: number; message: string }) {
  const db = await database();
  const [product] = await db.select().from(marketplaceProducts).where(and(eq(marketplaceProducts.id, input.productId), eq(marketplaceProducts.status, "published"))).limit(1);
  if (!product) throw new Error("This product is not currently available for customer messages.");
  const result = await db.insert(buyerContacts).values({ productId: product.id, buyerUserId: userId, sellerId: product.sellerId, message: input.message });
  return { id: Number(result[0].insertId), productId: product.id };
}

export async function listSellerContacts(userId: number) {
  const db = await database();
  const seller = await requireApprovedSeller(userId);
  return db.select({ contact: buyerContacts, productName: marketplaceProducts.name, buyerName: users.name, buyerEmail: users.email }).from(buyerContacts).innerJoin(marketplaceProducts, eq(buyerContacts.productId, marketplaceProducts.id)).innerJoin(users, eq(buyerContacts.buyerUserId, users.id)).where(eq(buyerContacts.sellerId, seller.id)).orderBy(desc(buyerContacts.updatedAt));
}

export async function updateSellerContact(userId: number, contactId: number, status: ContactStatus) {
  const db = await database();
  const seller = await requireApprovedSeller(userId);
  const [contact] = await db.select().from(buyerContacts).where(and(eq(buyerContacts.id, contactId), eq(buyerContacts.sellerId, seller.id))).limit(1);
  if (!contact) throw new Error("You can manage only customer messages sent to your shop.");
  await db.update(buyerContacts).set({ status }).where(eq(buyerContacts.id, contactId));
  return { id: contactId, status };
}

export async function listPublishedAnnouncements() {
  const db = await database();
  return db.select().from(announcements).where(eq(announcements.status, "published")).orderBy(desc(announcements.pinned), desc(announcements.publishedAt));
}

export async function createAnnouncement(authorUserId: number, input: { title: string; body: string; pinned: boolean; status: "draft" | "published" }) {
  const db = await database();
  const result = await db.insert(announcements).values({ authorUserId, title: input.title, body: input.body, pinned: input.pinned ? 1 : 0, status: input.status, publishedAt: input.status === "published" ? new Date() : null });
  return { id: Number(result[0].insertId) };
}

export async function listPublishedSiteSections() {
  const db = await database();
  return db.select().from(siteSections).where(eq(siteSections.status, "published")).orderBy(siteSections.displayOrder, desc(siteSections.publishedAt));
}

export async function listAdminSiteSections() {
  const db = await database();
  return db.select().from(siteSections).orderBy(siteSections.displayOrder, desc(siteSections.updatedAt));
}

export async function createSiteSection(authorUserId: number, input: { sectionType: SiteSectionType; title: string; body: string; actionLabel?: string; actionUrl?: string; imageUrl?: string; displayOrder: number; status: SiteSectionStatus }) {
  const db = await database();
  const result = await db.insert(siteSections).values({ ...input, authorUserId, actionLabel: input.actionLabel || null, actionUrl: input.actionUrl || null, imageUrl: input.imageUrl || null, publishedAt: input.status === "published" ? new Date() : null });
  return { id: Number(result[0].insertId) };
}

export async function updateSiteSection(sectionId: number, input: { sectionType: SiteSectionType; title: string; body: string; actionLabel?: string; actionUrl?: string; imageUrl?: string; displayOrder: number; status: SiteSectionStatus }) {
  const db = await database();
  await db.update(siteSections).set({ ...input, actionLabel: input.actionLabel || null, actionUrl: input.actionUrl || null, imageUrl: input.imageUrl || null, publishedAt: input.status === "published" ? new Date() : null }).where(eq(siteSections.id, sectionId));
  return { id: sectionId };
}

export async function listAdminSellerProfiles() {
  const db = await database();
  const rows = await db.select({ seller: sellerProfiles, userName: users.name, userEmail: users.email }).from(sellerProfiles).innerJoin(users, eq(sellerProfiles.userId, users.id)).orderBy(desc(sellerProfiles.createdAt));
  const badgeRows = await Promise.all(rows.map(async ({ seller }) => ({ sellerId: seller.id, badges: await db.select().from(sellerBadges).where(eq(sellerBadges.sellerId, seller.id)) })));
  const badgesBySeller = new Map(badgeRows.map(({ sellerId, badges }) => [sellerId, badges]));
  return rows.map((row) => ({ ...row, badges: badgesBySeller.get(row.seller.id) ?? [] }));
}

export async function reviewSellerProfile(adminUserId: number, sellerId: number, status: SellerStatus, reviewNote?: string) {
  const db = await database();
  await db.update(sellerProfiles).set({ status, reviewNote: reviewNote || null, reviewedAt: new Date(), reviewedByUserId: adminUserId }).where(eq(sellerProfiles.id, sellerId));
  return { sellerId, status };
}

export async function addSellerProfileForPrimaryAdmin(primaryAdminUserId: number, input: { userId: number; shopName: string; bio?: string; contactEmail?: string }) {
  const db = await database();
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, input.userId)).limit(1);
  if (!user) throw new Error("The buyer account could not be found. Ask the user to create an Anilyfe identity first.");
  const [existing] = await db.select({ id: sellerProfiles.id }).from(sellerProfiles).where(eq(sellerProfiles.userId, input.userId)).limit(1);
  if (existing) throw new Error("This account already has a seller profile.");
  const normalized = input.shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 140);
  const created = await db.insert(sellerProfiles).values({ userId: input.userId, shopName: input.shopName, shopSlug: `${normalized || "anilyfe-shop"}-${input.userId}`, bio: input.bio || null, contactEmail: input.contactEmail || null, status: "approved", reviewedAt: new Date(), reviewedByUserId: primaryAdminUserId });
  const sellerId = Number(created[0].insertId);
  await db.update(sellerProfiles).set({ sellerCode: `Seller${String(sellerId).padStart(3, "0")}` }).where(eq(sellerProfiles.id, sellerId));
  return { id: sellerId, sellerCode: `Seller${String(sellerId).padStart(3, "0")}` };
}

export async function removeSellerProfileForPrimaryAdmin(sellerId: number) {
  const db = await database();
  const [seller] = await db.select({ id: sellerProfiles.id }).from(sellerProfiles).where(eq(sellerProfiles.id, sellerId)).limit(1);
  if (!seller) throw new Error("The seller profile could not be found.");
  await db.delete(sellerProfiles).where(eq(sellerProfiles.id, sellerId));
  return { sellerId };
}

export async function suspendSellerProfile(primaryAdminUserId: number, sellerId: number, reviewNote?: string) {
  const db = await database();
  await db.update(sellerProfiles).set({ status: "suspended", reviewNote: reviewNote || "Seller access removed by marketplace moderation.", reviewedAt: new Date(), reviewedByUserId: primaryAdminUserId }).where(eq(sellerProfiles.id, sellerId));
  return { sellerId, status: "suspended" as const };
}

export async function setSellerBadge(primaryAdminUserId: number, sellerId: number, badge: SellerBadgeName, enabled: boolean) {
  const db = await database();
  const [seller] = await db.select({ id: sellerProfiles.id }).from(sellerProfiles).where(eq(sellerProfiles.id, sellerId)).limit(1);
  if (!seller) throw new Error("The seller record could not be found.");
  if (enabled) {
    const existing = await db.select({ id: sellerBadges.id }).from(sellerBadges).where(and(eq(sellerBadges.sellerId, sellerId), eq(sellerBadges.badge, badge))).limit(1);
    if (!existing.length) await db.insert(sellerBadges).values({ sellerId, badge, assignedByUserId: primaryAdminUserId });
  } else {
    await db.delete(sellerBadges).where(and(eq(sellerBadges.sellerId, sellerId), eq(sellerBadges.badge, badge)));
  }
  return { sellerId, badge, enabled };
}

export async function getGovernanceForUser(user: { id: number; openId: string }) {
  const db = await database();
  let [governance] = await db.select().from(marketplaceGovernance).limit(1);
  if (!governance && user.openId === ENV.ownerOpenId) {
    await db.insert(marketplaceGovernance).values({ primaryAdminUserId: user.id });
    [governance] = await db.select().from(marketplaceGovernance).limit(1);
  }
  return { primaryAdminUserId: governance?.primaryAdminUserId ?? null, isPrimaryAdmin: governance?.primaryAdminUserId === user.id, bootstrapRequired: !governance };
}

export async function createAdminRequest(userId: number, reason?: string) {
  const db = await database();
  const [existing] = await db.select().from(adminRequests).where(eq(adminRequests.userId, userId)).limit(1);
  if (existing?.status === "approved") throw new Error("This account is already an approved administrator.");
  if (existing) {
    await db.update(adminRequests).set({ reason: reason || null, status: "pending", reviewedAt: null, reviewedByUserId: null, reviewNote: null }).where(eq(adminRequests.id, existing.id));
  } else {
    await db.insert(adminRequests).values({ userId, reason: reason || null });
  }
  return { status: "pending" as const };
}

export async function listAdminRequests() {
  const db = await database();
  return db.select({ request: adminRequests, userName: users.name, userEmail: users.email }).from(adminRequests).innerJoin(users, eq(adminRequests.userId, users.id)).orderBy(desc(adminRequests.updatedAt));
}

export async function reviewAdminRequest(primaryAdminUserId: number, requestId: number, status: Extract<AdminRequestStatus, "approved" | "rejected" | "revoked">, reviewNote?: string) {
  const db = await database();
  const [request] = await db.select().from(adminRequests).where(eq(adminRequests.id, requestId)).limit(1);
  if (!request) throw new Error("The administrator request could not be found.");
  if (request.userId === primaryAdminUserId) throw new Error("The primary administrator role cannot be changed from an account request.");
  await db.update(adminRequests).set({ status, reviewNote: reviewNote || null, reviewedAt: new Date(), reviewedByUserId: primaryAdminUserId }).where(eq(adminRequests.id, requestId));
  await db.update(users).set({ role: status === "approved" ? "admin" : "user" }).where(eq(users.id, request.userId));
  return { requestId, status };
}

export async function listAdminProducts() {
  const db = await database();
  return db.select({ product: marketplaceProducts, sellerName: sellerProfiles.shopName, sellerStatus: sellerProfiles.status }).from(marketplaceProducts).innerJoin(sellerProfiles, eq(marketplaceProducts.sellerId, sellerProfiles.id)).orderBy(desc(marketplaceProducts.updatedAt));
}

export async function reviewMarketplaceProduct(productId: number, status: "published" | "rejected", reviewNote?: string) {
  const db = await database();
  await db.update(marketplaceProducts).set({ status, reviewNote: reviewNote || null, publishedAt: status === "published" ? new Date() : null }).where(eq(marketplaceProducts.id, productId));
  return { productId, status };
}

export async function getAdminCounts() {
  const db = await database();
  const pendingSellers = await db.select({ id: sellerProfiles.id }).from(sellerProfiles).where(eq(sellerProfiles.status, "pending"));
  const submittedProducts = await db.select({ id: marketplaceProducts.id }).from(marketplaceProducts).where(eq(marketplaceProducts.status, "submitted"));
  const pendingAdminRequests = await db.select({ id: adminRequests.id }).from(adminRequests).where(eq(adminRequests.status, "pending"));
  return { pendingSellerCount: pendingSellers.length, submittedProductCount: submittedProducts.length, pendingAdminRequestCount: pendingAdminRequests.length };
}
