import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const assertSellerOwnsProduct = vi.hoisted(() => vi.fn());
const addProductImageForSeller = vi.hoisted(() => vi.fn());
const storagePut = vi.hoisted(() => vi.fn());

vi.mock("./marketplaceDb", () => ({ SUPPORTED_CURRENCIES: ["NGN", "USD", "GBP", "EUR"], assertSellerOwnsProduct, addProductImageForSeller }));
vi.mock("./storage", () => ({ storagePut }));

import { appRouter } from "./routers";

describe("seller product-image upload", () => {
  it("authorizes product ownership before storage and persists only returned image metadata", async () => {
    assertSellerOwnsProduct.mockResolvedValue(undefined);
    storagePut.mockResolvedValue({ key: "seller-products/7/99/product-image_a1b2c3d4.png", url: "/manus-storage/seller-products/7/99/product-image_a1b2c3d4.png" });
    addProductImageForSeller.mockResolvedValue({ id: 31, productId: 99 });
    const context: TrpcContext = {
      user: { id: 7, openId: "seller-7", name: "Seller", email: "seller@example.test", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const result = await appRouter.createCaller(context).seller.uploadProductImage({ productId: 99, base64: "aGVsbG8gd29ybGQ=", contentType: "image/png", altText: "Product image", sortOrder: 2 });

    expect(assertSellerOwnsProduct).toHaveBeenCalledWith(7, 99);
    expect(storagePut).toHaveBeenCalledWith("seller-products/7/99/product-image.png", expect.any(Buffer), "image/png");
    expect(assertSellerOwnsProduct.mock.invocationCallOrder[0]).toBeLessThan(storagePut.mock.invocationCallOrder[0] ?? Infinity);
    expect(addProductImageForSeller).toHaveBeenCalledWith(7, 99, { storageKey: "seller-products/7/99/product-image_a1b2c3d4.png", imageUrl: "/manus-storage/seller-products/7/99/product-image_a1b2c3d4.png", altText: "Product image", sortOrder: 2 });
    expect(result).toMatchObject({ id: 31, productId: 99 });
  });
});
