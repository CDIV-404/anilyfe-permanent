import { describe, expect, it } from "vitest";
import { addBuyerCartItem, toggleBuyerSavedItems, updateBuyerCartQuantity, type BuyerProductItem } from "./MarketplaceContext";

const figure: BuyerProductItem = { id: "preview-figure", name: "Sunrise figure", category: "figures", price: "₦25,000", image: "/manus-storage/figure.png", sellerName: "Anilyfe preview", preview: true, href: "/product/preview-figure" };

describe("buyer marketplace local state", () => {
  it("saves an item once and removes it on the next toggle", () => {
    expect(toggleBuyerSavedItems([], figure)).toEqual([figure]);
    expect(toggleBuyerSavedItems([figure], figure)).toEqual([]);
  });

  it("increments matching cart lines and removes a line when its quantity reaches zero", () => {
    const oneItem = addBuyerCartItem([], figure);
    expect(addBuyerCartItem(oneItem, figure)).toMatchObject([{ id: figure.id, quantity: 2 }]);
    expect(updateBuyerCartQuantity(oneItem, figure.id, 0)).toEqual([]);
  });
});
