import { describe, expect, it } from "vitest";
import { viewerMotionEnabled } from "./AnilyfeModelViewer";

describe("AnilyfeModelViewer motion preference", () => {
  it("disables continuous viewer motion when reduced motion is requested", () => {
    expect(viewerMotionEnabled(true)).toBe(false);
  });

  it("permits ambient viewer motion when reduced motion is not requested", () => {
    expect(viewerMotionEnabled(false)).toBe(true);
  });
});
