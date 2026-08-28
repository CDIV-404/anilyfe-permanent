import { describe, expect, it } from "vitest";
import { consumePostLoginRoute, rememberPostLoginRoute, SIGNED_OUT_ROUTE } from "./accountTransitions";

function memoryStorage() {
  const entries = new Map<string, string>();
  return { getItem: (key: string) => entries.get(key) ?? null, removeItem: (key: string) => entries.delete(key), setItem: (key: string, value: string) => entries.set(key, value) };
}

describe("account transitions", () => {
  it("retains and consumes an internal seller sign-in return path once", () => {
    const storage = memoryStorage();
    expect(rememberPostLoginRoute(storage, "route", "/seller")).toBe(true);
    expect(consumePostLoginRoute(storage, "route")).toBe("/seller");
    expect(consumePostLoginRoute(storage, "route")).toBeNull();
  });

  it("rejects external return paths and routes signed-out visitors to account entry", () => {
    const storage = memoryStorage();
    expect(rememberPostLoginRoute(storage, "route", "//untrusted.example")).toBe(false);
    expect(consumePostLoginRoute(storage, "route")).toBeNull();
    expect(SIGNED_OUT_ROUTE).toBe("/account");
  });
});
