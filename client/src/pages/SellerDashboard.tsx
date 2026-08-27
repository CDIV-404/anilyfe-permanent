import { type ChangeEvent, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, Inbox, PencilLine, Store, UploadCloud, X } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import MarketplaceHeader from "@/components/MarketplaceHeader";
import { trpc } from "@/lib/trpc";

const categoryOptions = ["figures", "clothing", "manga", "accessories", "posters", "digital", "home", "cosplay"] as const;
type Category = (typeof categoryOptions)[number];
const initialForm = { name: "", description: "", category: "figures" as Category, price: "", currency: "NGN" };
type EditProduct = { id: number; name: string; description: string; category: Category; price: string; currency: string };

function fileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const profileQuery = trpc.seller.profile.useQuery(undefined, { enabled: Boolean(user) });
  const productsQuery = trpc.seller.products.useQuery(undefined, { enabled: Boolean(user) });
  const contactsQuery = trpc.seller.contacts.useQuery(undefined, { enabled: Boolean(user && profileQuery.data?.status === "approved") });
  const applyForShop = trpc.seller.applyForShop.useMutation({ onSuccess: () => void profileQuery.refetch() });
  const createProduct = trpc.seller.createProduct.useMutation();
  const updateProduct = trpc.seller.updateProduct.useMutation();
  const uploadImage = trpc.seller.uploadProductImage.useMutation();
  const updateContact = trpc.seller.updateContact.useMutation({ onSuccess: () => void contactsQuery.refetch() });
  const [shop, setShop] = useState({ shopName: "", bio: "", contactEmail: "" });
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [editing, setEditing] = useState<EditProduct | null>(null);
  const [notice, setNotice] = useState("");
  const profile = profileQuery.data;

  const selectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).filter((file) => file.size <= 5 * 1024 * 1024).slice(0, 3);
    setFiles(selected);
    if ((event.target.files?.length ?? 0) !== selected.length) setNotice("Only up to 3 images under 5 MB each can be uploaded.");
  };

  const submitShop = async () => {
    setNotice("");
    try {
      await applyForShop.mutateAsync({ shopName: shop.shopName, bio: shop.bio || undefined, contactEmail: shop.contactEmail || undefined });
      setNotice("Your seller application is ready for administrator review.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Your application could not be submitted.");
    }
  };

  const submitProduct = async (status: "draft" | "submitted") => {
    setNotice("");
    try {
      const product = await createProduct.mutateAsync({ ...form, status });
      if (!product) throw new Error("The listing could not be created.");
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!file) continue;
        const base64 = await fileAsDataUrl(file);
        await uploadImage.mutateAsync({ productId: product.id, base64, contentType: file.type as "image/jpeg" | "image/png" | "image/webp", altText: form.name, sortOrder: index });
      }
      await utils.seller.products.invalidate();
      setForm(initialForm);
      setFiles([]);
      setNotice(status === "submitted" ? "Listing submitted for administrator approval." : "Draft listing saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The listing could not be saved.");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setNotice("");
    try {
      await updateProduct.mutateAsync({ productId: editing.id, product: { name: editing.name, description: editing.description, category: editing.category, price: editing.price, currency: editing.currency, status: "submitted" } });
      await utils.seller.products.invalidate();
      setEditing(null);
      setNotice("Your changes were saved and the listing has been resubmitted for review.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The listing could not be updated.");
    }
  };

  const openEdit = (product: { id: number; name: string; description: string; category: Category; price: string; currency: string }) => {
    setEditing({ id: product.id, name: product.name, description: product.description, category: product.category, price: String(product.price), currency: product.currency });
  };

  const pageHeading = <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#1658ad]">Seller Center</p><h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Manage your anime shop</h1><p className="mt-2 text-sm text-slate-500">Submit your shop, create and edit listings, update prices, manage images, and respond to buyers.</p></div><Link href="/" className="marketplace-secondary-button">Back to marketplace</Link></div>;

  return <div className="min-h-screen bg-[#f7f9fc] text-slate-800"><MarketplaceHeader /><main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">{pageHeading}
    {loading || profileQuery.isLoading ? <div className="h-48 animate-pulse rounded-2xl bg-white" /> : !user ? <section className="marketplace-panel mx-auto max-w-xl p-8 text-center"><Store className="mx-auto h-9 w-9 text-[#1658ad]" /><h2 className="mt-4 text-xl font-bold">Sign in to open Seller Center</h2><p className="mt-2 text-sm leading-6 text-slate-500">Your seller tools are protected so only you can edit your own shop and listings.</p><button onClick={() => startLogin()} className="marketplace-primary-button mx-auto mt-5">Create account / Log in</button></section> : !profile ? <section className="marketplace-panel mx-auto max-w-2xl p-6 sm:p-8"><div className="flex gap-3"><Store className="mt-1 h-6 w-6 shrink-0 text-[#1658ad]" /><div><h2 className="text-xl font-bold text-slate-900">Apply to become a seller</h2><p className="mt-1 text-sm leading-6 text-slate-500">Your shop remains pending until an administrator approves it. This protects buyers and keeps the marketplace organized.</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="marketplace-field sm:col-span-2">Shop name<input value={shop.shopName} onChange={(event) => setShop({ ...shop, shopName: event.target.value })} placeholder="e.g. Starfall Collectibles" /></label><label className="marketplace-field">Contact email<input value={shop.contactEmail} onChange={(event) => setShop({ ...shop, contactEmail: event.target.value })} placeholder="shop@example.com" type="email" /></label><label className="marketplace-field">Short shop bio<input value={shop.bio} onChange={(event) => setShop({ ...shop, bio: event.target.value })} placeholder="What does your shop offer?" /></label></div><button disabled={applyForShop.isPending || shop.shopName.trim().length < 3} onClick={submitShop} className="marketplace-primary-button mt-6 disabled:opacity-50">{applyForShop.isPending ? "Submitting…" : "Submit seller application"}</button>{notice ? <p className="mt-4 text-sm text-slate-600">{notice}</p> : null}</section> : profile.status !== "approved" ? <section className="marketplace-panel mx-auto max-w-2xl p-8"><div className="flex gap-4"><AlertCircle className="mt-0.5 h-7 w-7 shrink-0 text-[#d69218]" /><div><p className="text-sm font-bold text-[#9a6509]">Seller application: {profile.status}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{profile.status === "pending" ? "Your shop is in the review queue." : "Your shop application needs an update."}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{profile.reviewNote || "An administrator will review your shop profile before listing tools become available."}</p></div></div></section> : <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-5"><section className="marketplace-panel p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#1658ad]">Approved shop</p><h2 className="mt-1 text-xl font-bold text-slate-900">{profile.shopName}</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="mr-1 inline h-4 w-4" />Approved</span></div><p className="mt-3 text-sm text-slate-500">Create a product with a name, description, category, price, and up to three product images. Submit it for review when it is ready.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="marketplace-field sm:col-span-2">Product name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Limited collector figure" /></label><label className="marketplace-field sm:col-span-2">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the condition, edition, materials, or what the buyer will receive." /></label><label className="marketplace-field">Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Category })}>{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="marketplace-field">Price (NGN)<input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="25000" inputMode="decimal" /></label></div><label className="marketplace-upload mt-4"><ImagePlus className="h-5 w-5 text-[#1658ad]" /><span><b>Add product images</b><small>PNG, JPG, or WEBP. Up to 3 images, 5 MB each.</small></span><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={selectFiles} /></label>{files.length ? <p className="mt-2 text-xs text-slate-500">Ready to upload: {files.map((file) => file.name).join(", ")}</p> : null}<div className="mt-5 flex flex-wrap gap-3"><button disabled={createProduct.isPending || !form.name || form.description.length < 12 || !form.price} onClick={() => void submitProduct("draft")} className="marketplace-secondary-button disabled:opacity-50">Save draft</button><button disabled={createProduct.isPending || !form.name || form.description.length < 12 || !form.price} onClick={() => void submitProduct("submitted")} className="marketplace-primary-button disabled:opacity-50"><UploadCloud className="h-4 w-4" />Submit for approval</button></div>{notice ? <p className="mt-4 text-sm text-slate-600">{notice}</p> : null}</section><section className="marketplace-panel p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">Your listings</h2><span className="text-xs text-slate-500">{productsQuery.data?.products.length ?? 0} total</span></div><div className="mt-4 divide-y divide-slate-100">{productsQuery.data?.products.length ? productsQuery.data.products.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 py-3"><div><b className="block text-sm text-slate-800">{product.name}</b><span className="text-xs text-slate-500">{product.category} · ₦{Number(product.price).toLocaleString()}</span></div><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${product.status === "published" ? "bg-emerald-50 text-emerald-700" : product.status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{product.status}</span><button onClick={() => openEdit({ id: product.id, name: product.name, description: product.description, category: product.category, price: product.price, currency: product.currency })} className="grid h-8 w-8 place-items-center rounded-md border border-blue-200 text-[#1658ad] hover:bg-blue-50" aria-label={`Edit ${product.name}`}><PencilLine className="h-4 w-4" /></button></div></div>) : <p className="py-5 text-sm text-slate-500">Your shop has no listings yet.</p>}</div></section></div><aside className="marketplace-panel h-fit p-5"><div className="flex items-center gap-2"><Inbox className="h-5 w-5 text-[#1658ad]" /><h2 className="font-bold text-slate-900">Customer messages</h2></div><p className="mt-2 text-xs leading-5 text-slate-500">Questions from buyers about your published listings appear here.</p><div className="mt-4 space-y-3">{contactsQuery.data?.length ? contactsQuery.data.map(({ contact, productName, buyerName }) => <article key={contact.id} className="rounded-xl border border-slate-100 p-3"><p className="text-xs font-bold text-slate-800">{buyerName || "Buyer"} · {productName}</p><p className="mt-1 text-xs leading-5 text-slate-500">{contact.message}</p><button onClick={() => updateContact.mutate({ contactId: contact.id, status: "replied" })} className="mt-2 text-[11px] font-bold text-[#1658ad]">Mark replied</button></article>) : <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">No buyer messages yet.</p>}</div></aside></div>}
  </main>{editing ? <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/35 p-4"><div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#1658ad]">Edit listing</p><h2 className="mt-1 text-xl font-bold text-slate-900">Update product and price</h2></div><button onClick={() => setEditing(null)} aria-label="Close editor" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="marketplace-field sm:col-span-2">Product name<input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label><label className="marketplace-field sm:col-span-2">Description<textarea value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label><label className="marketplace-field">Category<select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value as Category })}>{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="marketplace-field">Price ({editing.currency})<input value={editing.price} onChange={(event) => setEditing({ ...editing, price: event.target.value })} inputMode="decimal" /></label></div><p className="mt-4 text-xs leading-5 text-slate-500">Saving an edit sends the listing back to the administrator for review, including price changes.</p><div className="mt-5 flex gap-3"><button onClick={saveEdit} disabled={updateProduct.isPending || editing.name.trim().length < 3 || editing.description.trim().length < 12 || !editing.price} className="marketplace-primary-button disabled:opacity-50">{updateProduct.isPending ? "Saving…" : "Save and resubmit"}</button><button onClick={() => setEditing(null)} className="marketplace-secondary-button">Cancel</button></div></div></div> : null}</div>;
}
