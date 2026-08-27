import { decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const sellerProfiles = mysqlTable("seller_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  shopName: varchar("shopName", { length: 140 }).notNull(),
  shopSlug: varchar("shopSlug", { length: 160 }).notNull().unique(),
  bio: text("bio"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  logoUrl: text("logoUrl"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewNote: text("reviewNote"),
  reviewedAt: timestamp("reviewedAt"),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("seller_profiles_status_idx").on(table.status)]);

export const marketplaceProducts = mysqlTable("marketplace_products", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull().references(() => sellerProfiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["figures", "clothing", "manga", "accessories", "posters", "digital", "home", "cosplay"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("NGN").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "published", "rejected"]).default("draft").notNull(),
  reviewNote: text("reviewNote"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("marketplace_products_seller_idx").on(table.sellerId), index("marketplace_products_status_idx").on(table.status), index("marketplace_products_category_idx").on(table.category)]);

export const productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => marketplaceProducts.id, { onDelete: "cascade" }),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  altText: varchar("altText", { length: 240 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("product_images_product_idx").on(table.productId)]);

export const buyerContacts = mysqlTable("buyer_contacts", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => marketplaceProducts.id, { onDelete: "cascade" }),
  buyerUserId: int("buyerUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sellerId: int("sellerId").notNull().references(() => sellerProfiles.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "replied", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("buyer_contacts_seller_idx").on(table.sellerId), index("buyer_contacts_buyer_idx").on(table.buyerUserId)]);

export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  authorUserId: int("authorUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  pinned: int("pinned").default(0).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("announcements_status_idx").on(table.status), index("announcements_pinned_idx").on(table.pinned)]);

export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type BuyerContact = typeof buyerContacts.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
