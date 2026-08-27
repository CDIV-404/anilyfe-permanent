import { Bell, ChevronDown, Heart, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import AnilyfeMark from "./AnilyfeMark";

const navItems = [{ label: "Home", href: "/" }, { label: "Marketplace", href: "/#products" }, { label: "Digital Products", href: "/#products" }, { label: "Physical Products", href: "/#products" }, { label: "New Arrivals", href: "/#products" }, { label: "Trending", href: "/#community" }, { label: "Community", href: "/#community" }];

export default function MarketplaceHeader() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const onSearch = (event: FormEvent) => { event.preventDefault(); document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" }); };

  return <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,.03)] backdrop-blur">
    <div className="mx-auto flex h-[72px] max-w-[1260px] items-center gap-4 px-4 sm:px-6">
      <Link href="/" aria-label="Anilyfe home" className="shrink-0"><AnilyfeMark /></Link>
      <form onSubmit={onSearch} className="hidden min-w-0 flex-1 items-center overflow-hidden rounded-full border border-slate-200 bg-white lg:flex">
        <Search className="ml-4 h-4 w-4 text-slate-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400" placeholder="Search for anime products, brands and more..." aria-label="Search marketplace" />
        <select aria-label="Product category" className="h-7 border-l border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none"><option>All Categories</option><option>Figures</option><option>Clothing</option><option>Manga</option></select>
        <button aria-label="Submit search" className="grid h-10 w-11 place-items-center bg-[#1658ad] text-white transition hover:bg-[#0e478e]"><Search className="h-4 w-4" /></button>
      </form>
      <div className="ml-auto hidden items-center gap-4 sm:flex">
        <button type="button" title="Wishlist" className="marketplace-utility"><Heart className="h-[18px] w-[18px]" /><span>Wishlist</span></button>
        <button type="button" title="Cart" className="marketplace-utility relative"><ShoppingCart className="h-[18px] w-[18px]" /><b className="absolute -right-1 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#1658ad] px-1 text-[9px] text-white">0</b><span>Cart</span></button>
        <button type="button" title="Notifications" className="marketplace-utility relative"><Bell className="h-[18px] w-[18px]" /><b className="absolute -right-1 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#1658ad] px-1 text-[9px] text-white">0</b><span>Notifications</span></button>
      </div>
      {loading ? <div className="hidden h-9 w-24 animate-pulse rounded-full bg-slate-100 md:block" /> : user ? <Link href={user.role === "admin" ? "/admin" : "/seller"} className="hidden items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2 text-left md:flex"><span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{(user.name || "A").slice(0, 1).toUpperCase()}</span><span className="max-w-24 truncate text-xs leading-4"><b className="block text-slate-800">{user.name || "Account"}</b><em className="not-italic text-slate-500">{user.role === "admin" ? "Admin" : "Buyer"}</em></span><ChevronDown className="h-3.5 w-3.5 text-slate-400" /></Link> : <div className="hidden items-center gap-2 md:flex"><Link href="/account" className="rounded-full px-3 py-2 text-xs font-semibold text-[#1658ad] transition hover:bg-blue-50">Create account</Link><button onClick={() => startLogin()} type="button" className="rounded-full bg-[#1658ad] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0e478e]">Log in</button></div>}
      <button type="button" onClick={() => setMobileOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 lg:hidden" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
    </div>
    <nav className="hidden h-11 border-t border-slate-100 lg:block"><div className="mx-auto flex h-full max-w-[1260px] items-center gap-7 px-6"><Link href="/#categories" className="-ml-6 flex h-full items-center gap-2 bg-[#1658ad] px-6 text-xs font-semibold text-white"><Menu className="h-4 w-4" /> Browse Categories</Link>{navItems.map((item) => <Link key={item.label} href={item.href} className="marketplace-nav-link">{item.label}</Link>)}</div></nav>
    {mobileOpen && <div className="border-t border-slate-100 bg-white p-4 lg:hidden"><form onSubmit={onSearch} className="mb-4 flex overflow-hidden rounded-lg border border-slate-200"><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 min-w-0 flex-1 px-3 text-sm outline-none" placeholder="Search products" /><button className="grid w-10 place-items-center bg-[#1658ad] text-white" aria-label="Search"><Search className="h-4 w-4" /></button></form><div className="grid grid-cols-2 gap-2">{navItems.map((item) => <Link onClick={() => setMobileOpen(false)} key={item.label} href={item.href} className="rounded-lg border border-slate-100 px-3 py-2 text-sm font-medium text-slate-700">{item.label}</Link>)}<Link href="/account" className="rounded-lg border border-slate-100 px-3 py-2 text-sm font-medium text-slate-700"><UserRound className="mr-2 inline h-4 w-4" />Account</Link></div></div>}
  </header>;
}
