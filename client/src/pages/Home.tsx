import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ChevronRight, Heart, Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { anilyfeAssets, type AnilyfeModelKey } from "@/lib/anilyfeAssets";

const AnilyfeModelViewer = lazy(() => import("@/components/AnilyfeModelViewer"));

type Collection = {
  key: AnilyfeModelKey;
  title: string;
  label: string;
  description: string;
  subcategories: string[];
  image: string;
};

const collections: Collection[] = [
  { key: "figure", title: "Figures & collectibles", label: "Sage mode figure", description: "Sculpted stories for shelves, desks, and devoted collections.", subcategories: ["Original heroes", "Mecha & robots", "Limited editions"], image: anilyfeAssets.products.figure },
  { key: "hoodie", title: "Clothing & apparel", label: "Shadow crest hoodie", description: "Comfort-led pieces shaped by the worlds you return to.", subcategories: ["Streetwear", "Team jerseys", "Soft layers"], image: anilyfeAssets.products.hoodie },
  { key: "manga", title: "Manga & books", label: "Shonen box set", description: "Pages, panels, and collector sets for quiet late-night reading.", subcategories: ["Box sets", "Art books", "Light novels"], image: anilyfeAssets.products.manga },
  { key: "accessory", title: "Accessories", label: "Collector accessory set", description: "Small symbols with the power to make everyday rituals feel personal.", subcategories: ["Keychains", "Jewellery", "Desk finds"], image: anilyfeAssets.products.digital },
  { key: "poster", title: "Posters & wall art", label: "Battle scene print", description: "Thoughtful art for rooms that deserve a story of their own.", subcategories: ["Hobby posters", "Wall art", "Framed prints"], image: anilyfeAssets.products.poster },
  { key: "digital", title: "Digital products", label: "Wallpaper pack", description: "Instantly delivered worlds for your screen, stream, and space.", subcategories: ["Wallpapers", "Sound packs", "Creator tools"], image: anilyfeAssets.products.digital },
  { key: "home", title: "Home & living", label: "Anime living set", description: "Soft details that turn a room into a sanctuary for fandom.", subcategories: ["Mugs", "Desk mats", "Textiles"], image: anilyfeAssets.products.manga },
  { key: "cosplay", title: "Cosplay", label: "Fantasy cosplay set", description: "Layers, armor, and expressive pieces for fully inhabited characters.", subcategories: ["Cloaks", "Armor", "Wigs & props"], image: anilyfeAssets.products.hoodie },
];

const featured = [
  { name: "Sage mode figure", category: "Collectibles", image: anilyfeAssets.products.figure, tone: "lilac" },
  { name: "Shadow crest hoodie", category: "Apparel", image: anilyfeAssets.products.hoodie, tone: "blush" },
  { name: "Battle scene print", category: "Wall art", image: anilyfeAssets.products.poster, tone: "mint" },
  { name: "Shonen box set", category: "Manga", image: anilyfeAssets.products.manga, tone: "cream" },
];

function KunaiMark() {
  return <svg aria-hidden="true" className="kunai-mark" viewBox="0 0 52 72" fill="none"><path d="M25.9 3.3 35 18.8 29.2 22l-.6 22.7 8.3 16.2-11 7.5-11-7.5 8.3-16.2L22.6 22l-5.8-3.2 9.1-15.5Z" fill="currentColor"/><path d="m25.9 17.9 3.5 6-3.5 17.6-3.5-17.6 3.5-6Z" fill="#fff7ed" opacity=".92"/></svg>;
}

export default function Home() {
  const [selectedKey, setSelectedKey] = useState<AnilyfeModelKey>("figure");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const selected = useMemo(() => collections.find((item) => item.key === selectedKey) ?? collections[0], [selectedKey]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  return <div className="anilyfe-site">
    <div className="background-veil veil-one" />
    <div className="background-veil veil-two" />
    <div className="background-lines" aria-hidden="true" />
    <header className="site-header page-shell">
      <a href="#top" className="brand" aria-label="Anilyfe home"><span>AN</span><KunaiMark /><span>LYFE</span></a>
      <nav className="desktop-nav" aria-label="Primary navigation"><a href="#collections">Collections</a><a href="#featured">Curated finds</a><a href="#about">Our story</a></nav>
      <div className="header-actions"><button className="icon-button" aria-label="Search"><Search size={17} /></button><button className="icon-button" aria-label="Wishlist"><Heart size={17} /></button><button className="icon-button" aria-label="Cart"><ShoppingBag size={17} /></button><button className="icon-button mobile-menu" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}</button></div>
    </header>
    {mobileMenuOpen && <nav className="mobile-drawer" aria-label="Mobile navigation"><a href="#collections" onClick={() => setMobileMenuOpen(false)}>Collections <ChevronRight size={16} /></a><a href="#featured" onClick={() => setMobileMenuOpen(false)}>Curated finds <ChevronRight size={16} /></a><a href="#about" onClick={() => setMobileMenuOpen(false)}>Our story <ChevronRight size={16} /></a></nav>}

    <main id="top" className="page-shell">
      <section className="hero-section">
        <div className="hero-copy hero-entrance">
          <p className="eyebrow"><span /> Anilyfe permanent edition</p>
          <h1>Collect worlds<br /><em>with feeling.</em></h1>
          <p className="hero-intro">A calmer marketplace for the things that make anime fandom feel like home. Explore thoughtful physical, digital, and collectible pieces.</p>
          <div className="hero-cta-row"><a className="primary-cta" href="#collections">Explore the collections <ArrowUpRight size={16} /></a><a className="text-cta" href="#about">Our collector promise <ChevronRight size={16} /></a></div>
          <div className="hero-notes"><span>Curated with intention</span><span>Interactive 3D previews</span><span>Made for collectors</span></div>
        </div>
        <div className="hero-model-card">
          <div className="corner-bracket top-left" /><div className="corner-bracket top-right" /><div className="corner-bracket bottom-left" /><div className="corner-bracket bottom-right" />
          <div className="model-card-label"><span>01 / 08</span><span>Interactive object study</span></div>
          <Suspense fallback={<div className="model-viewer-fallback">Preparing the interactive 3D preview…</div>}><AnilyfeModelViewer label={selected.label} modelUrl={anilyfeAssets.models[selected.key]} reducedMotion={reducedMotion} /></Suspense>
        </div>
      </section>

      <section className="quiet-marquee" aria-label="Marketplace values"><span>Quietly collectible</span><i /><span>Built for fandom</span><i /><span>Gentle motion</span><i /><span>Always evolving</span></section>

      <section id="collections" className="collection-section">
        <div className="section-header"><div><p className="eyebrow"><span /> Explore by feeling</p><h2>Categories with a little more world inside them.</h2></div><p className="section-aside">Choose a collection to reveal its subcategories and switch the live 3D object.</p></div>
        <div className="collection-tabs" role="tablist" aria-label="Marketplace collections">
          {collections.map((collection, index) => <button key={collection.key} type="button" role="tab" aria-selected={selectedKey === collection.key} className={selectedKey === collection.key ? "active" : ""} onClick={() => setSelectedKey(collection.key)}><span>0{index + 1}</span>{collection.title}</button>)}
        </div>
        <div className="active-collection-card">
          <div className="active-collection-image"><img src={selected.image} alt="" /></div>
          <div className="active-collection-copy"><p className="eyebrow"><span /> {selected.title}</p><h3>{selected.description}</h3><div className="subcategory-list">{selected.subcategories.map((subcategory) => <a href="#featured" key={subcategory}>{subcategory}<ArrowUpRight size={14} /></a>)}</div></div>
          <button type="button" className="model-focus-button" onClick={() => document.querySelector(".hero-model-card")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" })}><Sparkles size={16} /> Focus 3D preview</button>
        </div>
      </section>

      <section id="featured" className="featured-section"><div className="section-header compact"><div><p className="eyebrow"><span /> Gentle discoveries</p><h2>Curated finds for every kind of fan.</h2></div><a href="#collections" className="text-cta">View all collections <ChevronRight size={16} /></a></div><div className="product-grid">{featured.map((product, index) => <article className={`product-card ${product.tone}`} key={product.name}><div className="product-index">0{index + 1}</div><div className="product-image"><img src={product.image} alt={product.name} /></div><div className="product-content"><p>{product.category}</p><h3>{product.name}</h3><button type="button" aria-label={`Explore ${product.name}`}><ArrowUpRight size={17} /></button></div></article>)}</div></section>

      <section id="about" className="figma-bridge"><div className="figma-bridge-number">03</div><div><p className="eyebrow"><span /> Collector promise</p><h2>Objects with stories.<br />A home for your fandom.</h2></div><p>Anilyfe keeps product artwork and interactive 3D previews on reliable media storage, so browsing remains light, responsive, and ready for the worlds you return to most.</p><div className="figma-actions"><a href="#collections">Explore all collections <ArrowUpRight size={15} /></a><a href="#top">Return to the beginning <ArrowUpRight size={15} /></a></div></section>
    </main>

    <footer className="site-footer page-shell"><a href="#top" className="brand footer-brand"><span>AN</span><KunaiMark /><span>LYFE</span></a><p>For the fans who make a world feel lived in.</p><div><a href="#collections">Collections</a><a href="#about">Our story</a><a href="#top">Back to top</a></div><span>© 2026 Anilyfe</span></footer>
  </div>;
}
