import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const createSiteSection = vi.hoisted(() => vi.fn());

vi.mock("./marketplaceDb", () => ({
  SUPPORTED_CURRENCIES: ["NGN", "USD", "GBP", "EUR"],
  createSiteSection,
}));

import { appRouter } from "./routers";

describe("administrator marketplace sections", () => {
  it("creates a validated published section as the authenticated administrator", async () => {
    createSiteSection.mockResolvedValue({ id: 31 });
    const context: TrpcContext = {
      user: { id: 8, openId: "admin-8", name: "Administrator", email: "admin@example.test", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const section = { sectionType: "banner" as const, title: "Collector spotlight", body: "A curated feature for collectors in the Anilyfe community.", actionLabel: "Browse now", actionUrl: "/marketplace", imageUrl: "/manus-storage/collector-spotlight.png", displayOrder: 1, status: "published" as const };

    await expect(appRouter.createCaller(context).admin.createSection(section)).resolves.toEqual({ id: 31 });
    expect(createSiteSection).toHaveBeenCalledWith(8, section);
  });
});
