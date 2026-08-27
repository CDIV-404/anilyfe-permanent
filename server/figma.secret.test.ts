import { describe, expect, it } from "vitest";

describe("Figma token configuration", () => {
  it("authenticates against Figma without exposing the token", async () => {
    const token = process.env.FIGMA_TOKEN;
    expect(token, "FIGMA_TOKEN must be configured").toBeTruthy();

    const response = await fetch("https://api.figma.com/v1/me", {
      headers: { "X-Figma-Token": token! },
    });

    expect(response.ok, `Figma authentication failed with HTTP ${response.status}`).toBe(true);
    const user = await response.json() as { id?: string };
    expect(user.id).toBeTruthy();
  }, 20_000);
});
