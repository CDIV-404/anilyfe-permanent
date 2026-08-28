export const SIGNED_OUT_ROUTE = "/account";

type RouteStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

function isInternalPath(path: string) { return path.startsWith("/") && !path.startsWith("//"); }

export function rememberPostLoginRoute(storage: RouteStorage, key: string, returnPath?: string) {
  if (!returnPath || !isInternalPath(returnPath)) return false;
  storage.setItem(key, returnPath);
  return true;
}

export function consumePostLoginRoute(storage: RouteStorage, key: string) {
  const destination = storage.getItem(key);
  storage.removeItem(key);
  return destination && isInternalPath(destination) ? destination : null;
}
