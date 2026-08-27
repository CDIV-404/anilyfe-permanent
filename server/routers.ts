import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as marketplaceDb from "./marketplaceDb";
import { storagePut } from "./storage";

const categorySchema = z.enum(["figures", "clothing", "manga", "accessories", "posters", "digital", "home", "cosplay"]);
const productInputSchema = z.object({
  name: z.string().trim().min(3).max(180),
  description: z.string().trim().min(12).max(4000),
  category: categorySchema,
  price: z.string().regex(/^\d{1,8}(\.\d{1,2})?$/, "Enter a valid price."),
  currency: z.string().trim().toUpperCase().length(3).default("NGN"),
  status: z.enum(["draft", "submitted"]),
});

function sellerSlug(shopName: string, userId: number) {
  const normalized = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 140);
  return `${normalized || "anilyfe-shop"}-${userId}`;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  marketplace: router({
    products: publicProcedure.input(z.object({ category: categorySchema.optional(), search: z.string().trim().min(1).max(120).optional() }).optional()).query(({ input }) => marketplaceDb.listPublishedProducts(input)),
    product: publicProcedure.input(z.object({ productId: z.number().int().positive() })).query(({ input }) => marketplaceDb.getPublishedProduct(input.productId)),
    announcements: publicProcedure.query(() => marketplaceDb.listPublishedAnnouncements()),
  }),
  seller: router({
    profile: protectedProcedure.query(({ ctx }) => marketplaceDb.getSellerProfileForUser(ctx.user.id)),
    applyForShop: protectedProcedure.input(z.object({ shopName: z.string().trim().min(3).max(140), bio: z.string().trim().max(2400).optional(), contactEmail: z.string().trim().email().optional() })).mutation(({ ctx, input }) => marketplaceDb.createSellerProfile({ ...input, userId: ctx.user.id, shopSlug: sellerSlug(input.shopName, ctx.user.id) })),
    products: protectedProcedure.query(({ ctx }) => marketplaceDb.listSellerProducts(ctx.user.id)),
    createProduct: protectedProcedure.input(productInputSchema).mutation(({ ctx, input }) => marketplaceDb.createSellerProduct(ctx.user.id, input)),
    updateProduct: protectedProcedure.input(z.object({ productId: z.number().int().positive(), product: productInputSchema })).mutation(({ ctx, input }) => marketplaceDb.updateSellerProduct(ctx.user.id, input.productId, input.product)),
    uploadProductImage: protectedProcedure.input(z.object({ productId: z.number().int().positive(), base64: z.string().min(8).max(7_000_000), contentType: z.enum(["image/jpeg", "image/png", "image/webp"]), altText: z.string().trim().max(240).optional(), sortOrder: z.number().int().min(0).max(20).default(0) })).mutation(async ({ ctx, input }) => {
      await marketplaceDb.assertSellerOwnsProduct(ctx.user.id, input.productId);
      const base64 = input.base64.replace(/^data:image\/(jpeg|png|webp);base64,/, "");
      const bytes = Buffer.from(base64, "base64");
      if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
      const extension = input.contentType === "image/jpeg" ? "jpg" : input.contentType === "image/png" ? "png" : "webp";
      const stored = await storagePut(`seller-products/${ctx.user.id}/${input.productId}/product-image.${extension}`, bytes, input.contentType);
      return marketplaceDb.addProductImageForSeller(ctx.user.id, input.productId, { storageKey: stored.key, imageUrl: stored.url, altText: input.altText, sortOrder: input.sortOrder });
    }),
    contacts: protectedProcedure.query(({ ctx }) => marketplaceDb.listSellerContacts(ctx.user.id)),
    updateContact: protectedProcedure.input(z.object({ contactId: z.number().int().positive(), status: z.enum(["new", "replied", "closed"]) })).mutation(({ ctx, input }) => marketplaceDb.updateSellerContact(ctx.user.id, input.contactId, input.status)),
  }),
  buyer: router({
    contactSeller: protectedProcedure.input(z.object({ productId: z.number().int().positive(), message: z.string().trim().min(8).max(2400) })).mutation(({ ctx, input }) => marketplaceDb.createBuyerContact(ctx.user.id, input)),
  }),
  admin: router({
    counts: adminProcedure.query(() => marketplaceDb.getAdminCounts()),
    sellers: adminProcedure.query(() => marketplaceDb.listAdminSellerProfiles()),
    reviewSeller: adminProcedure.input(z.object({ sellerId: z.number().int().positive(), status: z.enum(["approved", "rejected"]), reviewNote: z.string().trim().max(1000).optional() })).mutation(({ ctx, input }) => marketplaceDb.reviewSellerProfile(ctx.user.id, input.sellerId, input.status, input.reviewNote)),
    products: adminProcedure.query(() => marketplaceDb.listAdminProducts()),
    reviewProduct: adminProcedure.input(z.object({ productId: z.number().int().positive(), status: z.enum(["published", "rejected"]), reviewNote: z.string().trim().max(1000).optional() })).mutation(({ input }) => marketplaceDb.reviewMarketplaceProduct(input.productId, input.status, input.reviewNote)),
    createAnnouncement: adminProcedure.input(z.object({ title: z.string().trim().min(4).max(180), body: z.string().trim().min(12).max(5000), pinned: z.boolean().default(false), status: z.enum(["draft", "published"]) })).mutation(({ ctx, input }) => marketplaceDb.createAnnouncement(ctx.user.id, input)),
  }),
});

export type AppRouter = typeof appRouter;
