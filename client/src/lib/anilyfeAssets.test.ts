import { describe, expect, it } from "vitest";
import { anilyfeAssets } from "./anilyfeAssets";

describe("Anilyfe production asset manifest", () => {
  it("maps every top-level marketplace category to a durable GLB asset", () => {
    expect(Object.keys(anilyfeAssets.models).sort()).toEqual([
      "accessory", "cosplay", "digital", "figure", "home", "hoodie", "manga", "poster",
    ]);
    Object.values(anilyfeAssets.models).forEach((url) => {
      expect(url).toMatch(/^\/manus-storage\/anilyfe-[a-z-]+_[a-f0-9]+\.glb$/);
    });
  });

  it("keeps runtime images on durable project storage", () => {
    expect(anilyfeAssets.hero).toMatch(/^\/manus-storage\//);
    expect(Object.values(anilyfeAssets.products)).toHaveLength(5);
    expect(Object.values(anilyfeAssets.products).every((url) => url.startsWith("/manus-storage/"))).toBe(true);
  });
});
