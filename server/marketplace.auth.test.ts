import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const getDbMock = vi.hoisted(() => vi.fn());
vi.mock("./db", () => ({ getDb: getDbMock }));

import { appRouter } from "./routers";
import * as marketplaceDb from "./marketplaceDb";
import { addProductImageForSeller, addSellerProfileForPrimaryAdmin, updateSellerContact, updateSellerProduct } from "./marketplaceDb";

function selectResult(rows: unknown[]) {
  return { from: () => ({ where: () => ({ limit: async () => rows }) }) };
}

const approvedSeller = { id: 41, userId: 7, status: "approved" };

describe("marketplace ownership enforcement", () => {
  it("rejects a product update when the product is not owned by the approved seller", async () => {
    const db = { select: vi.fn().mockReturnValueOnce(selectResult([approvedSeller])).mockReturnValueOnce(selectResult([])), update: vi.fn() };
    getDbMock.mockResolvedValue(db);

    await expect(updateSellerProduct(7, 99, { name: "Portal Figure", description: "A carefully described portal figure.", category: "figures", price: "22000.00", currency: "NGN", status: "draft" })).rejects.toThrow("belong to your approved seller profile");
    expect(db.update).not.toHaveBeenCalled();
  });

  it("lets an owning approved seller change a listing price and resubmit it for review", async () => {
    const set = vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) }));
    const db = {
      select: vi.fn()
        .mockReturnValueOnce(selectResult([approvedSeller]))
        .mockReturnValueOnce(selectResult([{ id: 99, sellerId: 41 }]))
        .mockReturnValueOnce(selectResult([{ id: 99, name: "Portal Figure", price: "29500.00", status: "submitted" }])),
      update: vi.fn(() => ({ set })),
    };
    getDbMock.mockResolvedValue(db);

    const updated = await updateSellerProduct(7, 99, { name: "Portal Figure", description: "A carefully described portal figure.", category: "figures", price: "29500.00", currency: "NGN", status: "submitted" });
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ price: "29500.00", status: "submitted" }));
    expect(updated).toMatchObject({ id: 99, price: "29500.00", status: "submitted" });
  });

  it("creates an already-approved seller profile with a stable Seller ID for an existing user", async () => {
    const set = vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) }));
    const values = vi.fn().mockResolvedValue([{ insertId: 73 }]);
    const db = {
      select: vi.fn().mockReturnValueOnce(selectResult([{ id: 19 }])).mockReturnValueOnce(selectResult([])),
      insert: vi.fn(() => ({ values })),
      update: vi.fn(() => ({ set })),
    };
    getDbMock.mockResolvedValue(db);

    await expect(addSellerProfileForPrimaryAdmin(1, { userId: 19, shopName: "Moon Harbor Collectibles", bio: "Collectible figures and curated manga editions." })).resolves.toEqual({ id: 73, sellerCode: "Seller073" });
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ userId: 19, shopName: "Moon Harbor Collectibles", shopSlug: "moon-harbor-collectibles-19", status: "approved", reviewedByUserId: 1 }));
    expect(set).toHaveBeenCalledWith({ sellerCode: "Seller073" });
  });

  it("rejects a seller contact update when the message was not sent to that seller", async () => {
    const db = { select: vi.fn().mockReturnValueOnce(selectResult([approvedSeller])).mockReturnValueOnce(selectResult([])), update: vi.fn() };
    getDbMock.mockResolvedValue(db);

    await expect(updateSellerContact(7, 12, "replied")).rejects.toThrow("sent to your shop");
    expect(db.update).not.toHaveBeenCalled();
  });

  it("rejects a product-image attachment when the product is not owned by the seller", async () => {
    const db = { select: vi.fn().mockReturnValueOnce(selectResult([approvedSeller])).mockReturnValueOnce(selectResult([])), insert: vi.fn() };
    getDbMock.mockResolvedValue(db);

    await expect(addProductImageForSeller(7, 99, { storageKey: "seller-products/7/99/image.png", imageUrl: "/manus-storage/image.png", altText: "Portal Figure", sortOrder: 0 })).rejects.toThrow("belong to your approved seller profile");
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("blocks a standard buyer account from administrator marketplace controls", async () => {
    const context: TrpcContext = {
      user: { id: 7, openId: "buyer-7", name: "Buyer", email: "buyer@example.test", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(context);
    await expect(caller.admin.counts()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.reviewSeller({ sellerId: 8, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.reviewProduct({ productId: 9, status: "published" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.createAnnouncement({ title: "Weekend collector update", body: "A detailed announcement for the marketplace community.", pinned: false, status: "published" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks a non-primary administrator from primary marketplace governance controls", async () => {
    const governanceSpy = vi.spyOn(marketplaceDb, "getGovernanceForUser").mockResolvedValue({ primaryAdminUserId: 1, isPrimaryAdmin: false, bootstrapRequired: false });
    const context: TrpcContext = {
      user: { id: 8, openId: "admin-8", name: "Administrator", email: "admin@example.test", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(context);

    await expect(caller.admin.reviewSeller({ sellerId: 8, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.addSeller({ userId: 19, shopName: "Moon Harbor Collectibles" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.suspendSeller({ sellerId: 8 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.removeSeller({ sellerId: 8, confirmation: "REMOVE SELLER" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.setSellerBadge({ sellerId: 8, badge: "trusted", enabled: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.reviewAdminRequest({ requestId: 4, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(governanceSpy).toHaveBeenCalledTimes(6);
    governanceSpy.mockRestore();
  });

  it("validates seller listing and image-upload input before any protected marketplace action", async () => {
    const context: TrpcContext = {
      user: { id: 7, openId: "buyer-7", name: "Buyer", email: "buyer@example.test", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(context);

    await expect(caller.seller.createProduct({ name: "x", description: "short", category: "figures", price: "free", currency: "NGN", status: "draft" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.seller.uploadProductImage({ productId: 1, base64: "tiny", contentType: "image/png", sortOrder: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects any seller-removal confirmation other than the exact required phrase before deletion", async () => {
    const removeSpy = vi.spyOn(marketplaceDb, "removeSellerProfileForPrimaryAdmin");
    const context: TrpcContext = {
      user: { id: 8, openId: "admin-8", name: "Administrator", email: "admin@example.test", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(context);

    await expect(caller.admin.removeSeller({ sellerId: 8, confirmation: "remove seller" as "REMOVE SELLER" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(removeSpy).not.toHaveBeenCalled();
    removeSpy.mockRestore();
  });

  it("rejects unsafe configurable marketplace section links before administrator actions run", async () => {
    const context: TrpcContext = {
      user: { id: 8, openId: "admin-8", name: "Administrator", email: "admin@example.test", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(context);

    await expect(caller.admin.createSection({ sectionType: "banner", title: "Collector spotlight", body: "A clear community update for the marketplace section.", actionLabel: "Open", actionUrl: "javascript:alert(1)", displayOrder: 1, status: "published" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.admin.createSection({ sectionType: "banner", title: "Collector spotlight", body: "A clear community update for the marketplace section.", imageUrl: "data:image/svg+xml,unsafe", displayOrder: 1, status: "draft" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
