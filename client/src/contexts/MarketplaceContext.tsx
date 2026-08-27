import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type BuyerProductItem = { id: string; name: string; category: string; price: string; image: string; sellerName: string; preview?: boolean; href?: string };
export type CartLine = BuyerProductItem & { quantity: number };
type MarketplaceContextValue = {
  savedItems: BuyerProductItem[];
  cartItems: CartLine[];
  savedOpen: boolean;
  cartOpen: boolean;
  toggleSavedItem: (item: BuyerProductItem) => void;
  addToCart: (item: BuyerProductItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setSavedOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  clearCart: () => void;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);
const storageKey = "anilyfe-buyer-marketplace-v1";

export function toggleBuyerSavedItems(items: BuyerProductItem[], item: BuyerProductItem) {
  return items.some((saved) => saved.id === item.id) ? items.filter((saved) => saved.id !== item.id) : [...items, item];
}

export function addBuyerCartItem(items: CartLine[], item: BuyerProductItem) {
  const match = items.find((line) => line.id === item.id);
  return match ? items.map((line) => line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line) : [...items, { ...item, quantity: 1 }];
}

export function updateBuyerCartQuantity(items: CartLine[], id: string, quantity: number) {
  return quantity < 1 ? items.filter((line) => line.id !== id) : items.map((line) => line.id === id ? { ...line, quantity: Math.min(99, quantity) } : line);
}

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<BuyerProductItem[]>([]);
  const [cartItems, setCartItems] = useState<CartLine[]>([]);
  const [savedOpen, setSavedOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { savedItems?: BuyerProductItem[]; cartItems?: CartLine[] };
      if (Array.isArray(parsed.savedItems)) setSavedItems(parsed.savedItems);
      if (Array.isArray(parsed.cartItems)) setCartItems(parsed.cartItems);
    } catch { /* Local buyer state is optional and should never block browsing. */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ savedItems, cartItems })); } catch { /* Storage may be disabled by the browser. */ }
  }, [savedItems, cartItems]);

  const value = useMemo<MarketplaceContextValue>(() => ({
    savedItems,
    cartItems,
    savedOpen,
    cartOpen,
    toggleSavedItem: (item) => setSavedItems((items) => toggleBuyerSavedItems(items, item)),
    addToCart: (item) => { setCartItems((items) => addBuyerCartItem(items, item)); setCartOpen(true); },
    removeFromCart: (id) => setCartItems((items) => items.filter((line) => line.id !== id)),
    updateQuantity: (id, quantity) => setCartItems((items) => updateBuyerCartQuantity(items, id, quantity)),
    setSavedOpen,
    setCartOpen,
    clearCart: () => setCartItems([]),
  }), [savedItems, cartItems, savedOpen, cartOpen]);

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) throw new Error("useMarketplace must be used within MarketplaceProvider.");
  return context;
}
