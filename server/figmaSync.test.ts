import { describe, expect, it } from "vitest";
import { getFigmaSyncConfig, isValidWebhookPasscode, parseFigmaNodeIds } from "./figmaSync";

describe("Figma sync configuration", () => {
  it("parses unique export node identifiers without empty values", () => {
    expect(parseFigmaNodeIds("12:4, 8:9, , 4:2")).toEqual(["12:4", "8:9", "4:2"]);
  });

  it("requires all server-only values before an export can begin", () => {
    expect(() => getFigmaSyncConfig({ FIGMA_TOKEN: "private-token", FIGMA_FILE_KEY: "file-key" })).toThrow("FIGMA_NODE_IDS");
    expect(getFigmaSyncConfig({ FIGMA_TOKEN: "private-token", FIGMA_FILE_KEY: "file-key", FIGMA_NODE_IDS: "12:4" })).toMatchObject({ fileKey: "file-key", nodeIds: ["12:4"] });
  });

  it("rejects mismatched webhook passcodes", () => {
    expect(isValidWebhookPasscode("wrong", "right")).toBe(false);
    expect(isValidWebhookPasscode("right", "right")).toBe(true);
  });
});
