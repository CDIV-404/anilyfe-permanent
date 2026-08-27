import { anilyfeAssets } from "./anilyfeAssets";

export type PreviewMarketplaceProduct = {
  id: string;
  name: string;
  category: "figures" | "clothing" | "manga" | "accessories" | "posters" | "digital" | "home" | "cosplay";
  price: string;
  image: string;
  description: string;
};

export const previewMarketplaceProducts: PreviewMarketplaceProduct[] = [
  { id: "preview-figure", name: "Sunrise adventurer figure", category: "figures", price: "25000", image: anilyfeAssets.products.figure, description: "A stylized original collector figure presented as a marketplace preview. Explore the interactive 3D figure category for the corresponding GLB model." },
  { id: "preview-hoodie", name: "Midnight fox hoodie", category: "clothing", price: "18000", image: anilyfeAssets.products.hoodie, description: "A premium black hoodie concept with an original blue fox emblem. This listing is an Anilyfe preview product until approved seller products are available." },
  { id: "preview-poster", name: "Dusk blade art print", category: "posters", price: "3500", image: anilyfeAssets.products.poster, description: "An original moody anime-inspired wall-art concept, displayed as a preview of the posters and wall art category." },
  { id: "preview-manga", name: "Celestial archive set", category: "manga", price: "28000", image: anilyfeAssets.products.manga, description: "A collector-style original box-set concept for the manga and books category. Browse live approved listings when sellers begin publishing." },
  { id: "preview-digital", name: "Signal soundtrack pack", category: "digital", price: "1500", image: anilyfeAssets.products.digital, description: "An original digital marketplace preview for a soundtrack and visual-asset pack." },
];

export function previewProductById(id: string | undefined) {
  return previewMarketplaceProducts.find((product) => product.id === id) ?? null;
}

export function formatMarketplacePrice(value: string, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value));
}
