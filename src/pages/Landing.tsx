import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Search,
  Award,
  Lightbulb,
  Leaf,
  ShoppingCart,
  LogOut,
  KeyRound,
  Package,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { LanguageSelector } from "@/components/LanguageSelector";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/store/useLanguage";
import { tr } from "@/lib/i18n";
import { API_URLS } from "@/constants/apiUrls";
import {
  WA_NUMBER,
  WA_DEFAULT,
  type LandingProduct,
} from "@/constants/landingStatic";
import { usePageLoader } from "@/store/usePageLoader";
import { Select } from "@/components/Select";
import { SectionEmpty } from "@/components/SectionEmpty";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";

type ProductItem = LandingProduct & { series: string }

const PAGE_SIZE = 6

const PRODUCT_IMAGE: Record<string, string> = {
  "AFS Premium":       "/images/products/afs-1000ml.jpg",
  "H&E Complete":      "/images/products/HE-combined.jpg",
  "H&E Complete Kit":  "/images/products/HE-combined.jpg",
  "CV Staining":       "/images/products/CV-combined.jpg",
  "CV Staining Set":   "/images/products/CV-combined.jpg",
  "PBS 1x Standard":   "/images/products/10x-pbs.jpg",
  "PBS 10x Concentrate": "/images/products/10x-pbs.jpg",
}

function productImage(name: string): string {
  const key = Object.keys(PRODUCT_IMAGE).find((k) => name.startsWith(k))
  return key ? PRODUCT_IMAGE[key] : "/images/products/AFS-vs-PBS.jpg"
}

const CAROUSEL_IMAGES = [
  "/images/products/HE-combined.jpg",
  "/images/products/CV-combined.jpg",
  "/images/products/AFS-vs-PBS.jpg",
  "/images/products/afs-1000ml.jpg",
  "/images/products/10x-pbs.jpg",
]

const CAROUSEL_LABELS = [
  "H&E Staining Solution",
  "CV Staining Set",
  "AFS vs PBS Comparison",
  "AFS Premium 1000ml",
  "PBS 10x Concentrate",
]

export default function Landing() {
  const { lang } = useLanguage();
  const t = (key: string) => tr(lang, key);
  const { isAuthenticated, user, logout } = useAuth();
  const { items: cartItems, addingProductIds, addItem, fetch: fetchCart } = useCart();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "staining" | "buffer">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "name-desc">("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    clinic: "",
    city: "",
    whatsapp: "",
    product_interest: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLElement>(null);
  const push = usePageLoader((s) => s.push);
  const pop = usePageLoader((s) => s.pop);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!avatarOpen) return;
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [avatarOpen]);

  useEffect(() => {
    const timer = setInterval(
      () => setCarouselIdx((i) => (i + 1) % CAROUSEL_IMAGES.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      push();
      try {
        const res = await fetch(API_URLS.public.products);
        const data = await res.json();
        if (data.success) {
          setAllProducts(
            data.data.map((p: { id: string; series: string; name: string; nanoparticles: string; type: string; description: string; price?: number | null }) => ({
              id: p.id,
              series: p.series,
              name: p.name,
              nanoparticles: p.nanoparticles,
              type: p.type,
              description: p.description,
              price: p.price,
            }))
          );
        }
      } catch {
        // API may not be available
      }
      pop();
      setIsLoading(false);
    };
    fetchProducts();
  }, [push, pop]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => { setCurrentPage(1); }, [activeCategory, searchQuery, sortBy]);

  const filteredProducts = allProducts
    .filter((p) => {
      const matchCat = activeCategory === "all" || p.series === activeCategory;
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const productGroups = [
    {
      label: "Staining Solutions",
      options: [
        { value: "AFS Premium 100ml", label: "AFS Premium — 100ml" },
        { value: "AFS Premium 500ml", label: "AFS Premium — 500ml" },
        { value: "AFS Premium 1000ml", label: "AFS Premium — 1000ml" },
        { value: "H&E Complete Kit", label: "H&E Complete Kit — 500ml Each" },
        { value: "CV Staining Set 100ml", label: "CV Staining Set — 100ml" },
        { value: "CV Staining Set 500ml", label: "CV Staining Set — 500ml" },
      ],
    },
    {
      label: "Buffer Solutions",
      options: [
        { value: "PBS 1x Standard 500ml", label: "PBS 1x Standard — 500ml" },
        { value: "PBS 1x Standard 1000ml", label: "PBS 1x Standard — 1000ml" },
        { value: "PBS 10x Concentrate 500ml", label: "PBS 10x Concentrate — 500ml" },
        { value: "PBS 10x Concentrate 1000ml", label: "PBS 10x Concentrate — 1000ml" },
      ],
    },
    {
      label: "Lainnya",
      options: [{ value: "unknown", label: t("form.product.unknown") }],
    },
  ];
  const flatProductOptions = productGroups.flatMap((g) => g.options);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(API_URLS.public.inquirySubmit, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      // backend may not be ready
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) { window.location.href = '/login?next=/cart'; return; }
    addItem(productId);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-200",
          scrolled
            ? "bg-white shadow-sm border-b border-black/[0.06]"
            : "bg-white/95 backdrop-blur-sm"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo className="h-14 w-auto" variant="horizontal" />

          <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-500">
            <a href="#produk" className="px-3 py-2 rounded-xl hover:text-gray-900 hover:bg-black/[0.04] transition-all">
              {t("nav.products")}
            </a>
            <a href="#tentang" className="px-3 py-2 rounded-xl hover:text-gray-900 hover:bg-black/[0.04] transition-all">
              {t("nav.about")}
            </a>
            <a href="#kontak" className="px-3 py-2 rounded-xl hover:text-gray-900 hover:bg-black/[0.04] transition-all">
              {t("nav.contact")}
            </a>
            <div className="w-px h-5 bg-black/[0.10] mx-1" />
            <LanguageSelector />
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative ms-1 p-2 text-gray-500 hover:text-gray-900 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
                <div ref={avatarRef} className="relative ms-1">
                  <button
                    onClick={() => setAvatarOpen((v) => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-black/[0.04] transition-all"
                  >
                    <Avatar name={user?.full_name || user?.email} size="md" />
                    <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                      {user?.full_name?.split(" ")[0] || user?.email}
                    </span>
                  </button>
                  {avatarOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-black/[0.08] rounded-2xl shadow-lg py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-black/[0.06] mb-1">
                        <p className="text-xs font-black text-gray-900 truncate">{user?.full_name || "—"}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-black/[0.04] transition-colors"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        Riwayat Pesanan
                      </Link>
                      <Link
                        to="/change-password"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-black/[0.04] transition-colors"
                      >
                        <KeyRound className="w-4 h-4 text-gray-400" />
                        Ubah Password
                      </Link>
                      <div className="border-t border-black/[0.06] mt-1 pt-1">
                        <button
                          onClick={() => { setAvatarOpen(false); logout(); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={scrollToForm}
                  className="ms-1 px-5 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity font-bold"
                >
                  {t("nav.consultation")}
                </button>
              </>
            ) : (
              <Link to="/login" className="ms-1 px-5 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity font-bold">
                Masuk / Daftar
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <LanguageSelector />
            {isAuthenticated && (
              <Link to="/cart" className="relative p-2 text-gray-500 hover:text-gray-900">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 text-gray-500 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <Logo className="h-14 w-auto" variant="horizontal" />
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-black/[0.06]">
                <Avatar name={user.full_name || user.email} size="lg" />
                <div>
                  <p className="text-base font-black text-gray-900">{user.full_name || "—"}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4 text-2xl font-black">
              <a href="#produk" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-gray-900">
                {t("nav.products")}
              </a>
              <a href="#tentang" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-gray-900">
                {t("nav.about")}
              </a>
              <a href="#kontak" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-gray-900">
                {t("nav.contact")}
              </a>
              {isAuthenticated ? (
                <>
                  <Link to="/orders" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-gray-900">
                    Pesanan Saya
                  </Link>
                  <Link to="/change-password" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-gray-900">
                    Ubah Password
                  </Link>
                  <button onClick={scrollToForm} className="text-start text-primary">
                    {t("nav.consultation")} →
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); logout(); }}
                    className="text-start text-red-500 font-black"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-primary font-black">
                  Masuk / Daftar →
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
              {t("hero.headline")}
            </h1>
            <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-lg">
              {t("hero.subtext")}
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <a
                href="#produk"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                {t("hero.explore")}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_DEFAULT)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-black/[0.10] text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
            <p className="text-sm text-gray-400 font-semibold">{t("hero.trusted")}</p>
          </motion.div>

          {/* Right: carousel */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={carouselIdx}
                src={CAROUSEL_IMAGES[carouselIdx]}
                alt={CAROUSEL_LABELS[carouselIdx]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex items-end justify-between">
              <p className="text-white text-sm font-bold">{CAROUSEL_LABELS[carouselIdx]}</p>
              {/* Dots */}
              <div className="flex gap-1.5">
                {CAROUSEL_IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIdx(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === carouselIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                    )}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => setCarouselIdx((i) => (i - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCarouselIdx((i) => (i + 1) % CAROUSEL_IMAGES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Products ────────────────────────────────────────────────────────── */}
      <section
        id="produk"
        className="scroll-mt-24 py-24 px-6 bg-gray-50 border-t border-black/[0.06]"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">
              {t("products.label")}
            </p>
            <h2 className="text-3xl font-black">{t("products.title")}</h2>
            <p className="text-gray-500 mt-2">{t("products.subtitle")}</p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="md:w-52 shrink-0">
              <div className="space-y-1">
                {(["all", "staining", "buffer"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      activeCategory === cat
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-black/[0.04]"
                    )}
                  >
                    {cat === "all"
                      ? t("products.filter.all")
                      : cat === "staining"
                      ? t("products.tab.staining")
                      : t("products.tab.buffer")}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main */}
            <div className="flex-1">
              {/* Search + Sort */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("products.search.ph")}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/[0.10] rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <Select
                  variant="public"
                  compact
                  isSearchable={false}
                  wrapperClassName="w-44 shrink-0"
                  options={[
                    { value: "default", label: "Urutan Default" },
                    { value: "name-asc", label: "Nama A–Z" },
                    { value: "name-desc", label: "Nama Z–A" },
                  ]}
                  value={{ value: sortBy, label: sortBy === "default" ? "Urutan Default" : sortBy === "name-asc" ? "Nama A–Z" : "Nama Z–A" }}
                  onChange={(opt) => opt && setSortBy((opt as { value: typeof sortBy }).value)}
                />
              </div>

              {/* Grid */}
              {!isLoading && filteredProducts.length === 0 ? (
                <SectionEmpty message="Produk tidak ditemukan" />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedProducts.map((product, i) => (
                    <motion.div
                      key={product.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="bg-white border border-black/[0.08] rounded-2xl hover:border-primary/20 hover:shadow-md hover:scale-105 transition-all flex flex-col overflow-hidden"
                    >
                      <img
                        src={productImage(product.name)}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-36 object-cover"
                      />
                      <div className="p-5 flex flex-col flex-1">
                      <div className="text-xs font-black text-primary uppercase tracking-widest mb-2">
                        {product.series === "staining"
                          ? t("products.tab.staining")
                          : t("products.tab.buffer")}
                      </div>
                      <h3 className="font-black text-base mb-1">{product.name}</h3>
                      <div className="text-sm font-semibold text-gray-600 mb-0.5">
                        {product.nanoparticles}
                      </div>
                      <div className="text-xs text-gray-400 font-medium mb-3">{product.type}</div>
                      <p className="text-sm text-gray-500 leading-relaxed flex-1">
                        {product.description}
                      </p>
                      <div className="mt-4 flex gap-2">
                        {product.id && (
                          <button
                            onClick={() => handleAddToCart(product.id!)}
                            disabled={addingProductIds.includes(product.id!)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
                          >
                            {addingProductIds.includes(product.id!) ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <ShoppingCart className="w-3.5 h-3.5" />
                            )}
                            Keranjang
                          </button>
                        )}
                        <a
                          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Halo TissuePro Tech ID, saya ingin menanyakan produk ${product.name}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black/[0.04] border border-black/[0.08] rounded-xl text-sm font-bold hover:bg-black/[0.08] transition-colors text-gray-700"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/[0.06]">
                  <p className="text-xs text-gray-400">
                    {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} dari {filteredProducts.length} produk
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-black/[0.08] text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-sm font-semibold transition-colors",
                          page === currentPage
                            ? "bg-primary text-white"
                            : "text-gray-600 hover:bg-gray-100 border border-black/[0.08]"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-black/[0.08] text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────────────────── */}
      <section
        id="tentang"
        className="scroll-mt-24 py-24 px-6 border-t border-black/[0.06]"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">
              {t("about.label")}
            </p>
            <h2 className="text-3xl font-black">{t("about.title")}</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 mb-14">
            {/* Founder card */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-black/[0.07] rounded-2xl overflow-hidden flex flex-col sm:grid sm:grid-cols-[13rem_1fr]"
            >
              <img
                src="/images/Dr-irawan-satriotomo.jpg"
                alt={t("about.founder.name")}
                className="w-full h-56 sm:h-full object-cover object-top"
              />
              <div className="p-6 flex flex-col justify-center">
                <div className="text-lg font-black mb-0.5">{t("about.founder.name")}</div>
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                  {t("about.founder.role")}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{t("about.founder.bio")}</p>
              </div>
            </motion.div>

            {/* Value cards */}
            <div className="space-y-4">
              {[
                { icon: Award, tk: "about.value1.title", bk: "about.value1.body" },
                { icon: Lightbulb, tk: "about.value2.title", bk: "about.value2.body" },
                { icon: Leaf, tk: "about.value3.title", bk: "about.value3.body" },
              ].map((item, i) => (
                <motion.div
                  key={item.tk}
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-white border border-black/[0.07] rounded-2xl"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t(item.tk)}</div>
                    <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">{t(item.bk)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-primary/5 border border-primary/15 rounded-2xl"
          >
            {(
              [
                { vk: "about.stat1.value", lk: "about.stat1.label" },
                { vk: "about.stat2.value", lk: "about.stat2.label" },
                { vk: "about.stat3.value", lk: "about.stat3.label" },
                { vk: "about.stat4.value", lk: "about.stat4.label" },
              ] as const
            ).map(({ vk, lk }) => (
              <div key={vk} className="text-center">
                <div className="text-3xl font-black text-primary">{t(vk)}</div>
                <div className="text-sm text-gray-600 font-semibold mt-1">{t(lk)}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Contact ─────────────────────────────────────────────────────────── */}
      <section
        ref={formRef}
        id="kontak"
        className="scroll-mt-24 py-24 px-6 bg-gray-50 border-t border-black/[0.06]"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">
              {t("contact.label")}
            </p>
            <h2 className="text-3xl font-black">{t("contact.title")}</h2>
            <p className="text-gray-500 mt-2">{t("contact.subtitle")}</p>
          </motion.div>

          {/* Info cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              {
                Icon: Mail,
                label: t("contact.email.label"),
                value: "customerservice@tissueprotech.com",
                href: "mailto:customerservice@tissueprotech.com",
              },
              {
                Icon: Phone,
                label: t("contact.phone.label"),
                value: "(352) 246-2080",
                href: "tel:+13522462080",
              },
              {
                Icon: MapPin,
                label: t("contact.address.label"),
                value: "Florida, United States of America",
                href: undefined,
              },
            ].map(({ Icon, label, value, href }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="p-5 bg-white border border-black/[0.08] rounded-2xl"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                  {label}
                </div>
                {href ? (
                  <a
                    href={href}
                    className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-gray-700">{value}</p>
                )}
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Hours + Social */}
            <div>
              <h3 className="font-black text-base mb-4">{t("contact.hours.label")}</h3>
              <div className="space-y-0 mb-8">
                {[
                  { day: t("contact.hours.weekdays"), time: t("contact.hours.weekdays.time"), closed: false },
                  { day: t("contact.hours.saturday"), time: t("contact.hours.saturday.time"), closed: false },
                  { day: t("contact.hours.sunday"), time: t("contact.hours.sunday.status"), closed: true },
                ].map(({ day, time, closed }) => (
                  <div
                    key={day}
                    className="flex justify-between text-sm py-2.5 border-b border-black/[0.05]"
                  >
                    <span className="text-gray-600">{day}</span>
                    <span className={cn("font-semibold", closed ? "text-red-400" : "text-gray-900")}>
                      {time}
                    </span>
                  </div>
                ))}
              </div>
              <h3 className="font-black text-base mb-3">{t("contact.social.label")}</h3>
              <div className="flex gap-3">
                <a
                  href="https://x.com/tissueprotech"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 border border-black/[0.10] rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  X / Twitter
                </a>
                <a
                  href="https://facebook.com/tissue.protech"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 border border-black/[0.10] rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Facebook
                </a>
              </div>
            </div>

            {/* Inquiry Form */}
            <div>
              <h3 className="font-black text-base mb-4">{t("form.label")}</h3>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-10 px-6 bg-white border border-black/[0.08] rounded-2xl"
                  >
                    <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h4 className="font-black mb-1">{t("form.success.title")}</h4>
                    <p className="text-sm text-gray-500 mb-4">{t("form.success.body")}</p>
                    <a
                      href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_DEFAULT)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {t("form.success.wa")}
                    </a>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label={t("form.name")}
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        required
                        placeholder={t("form.name.ph")}
                      />
                      <Field
                        label={t("form.specialty")}
                        name="specialty"
                        value={form.specialty}
                        onChange={handleFormChange}
                        placeholder={t("form.specialty.ph")}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label={t("form.clinic")}
                        name="clinic"
                        value={form.clinic}
                        onChange={handleFormChange}
                        required
                        placeholder={t("form.clinic.ph")}
                      />
                      <Field
                        label={t("form.city")}
                        name="city"
                        value={form.city}
                        onChange={handleFormChange}
                        placeholder={t("form.city.ph")}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-start">
                      <Field
                        label={t("form.wa")}
                        name="whatsapp"
                        value={form.whatsapp}
                        onChange={handleFormChange}
                        required
                        placeholder={t("form.wa.ph")}
                        type="tel"
                      />
                      <Select
                        variant="public"
                        label={t("form.product")}
                        options={productGroups}
                        value={
                          form.product_interest
                            ? (flatProductOptions.find((o) => o.value === form.product_interest) ?? null)
                            : null
                        }
                        onChange={(opt) =>
                          setForm((p) => ({ ...p, product_interest: opt?.value ?? "" }))
                        }
                        placeholder={t("form.product.ph")}
                        isSearchable={false}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-400">
                        {t("form.message")}
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleFormChange}
                        rows={3}
                        placeholder={t("form.message.ph")}
                        className="w-full bg-white border border-black/10 text-gray-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all resize-none placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
                      >
                        {submitting ? t("form.submitting") : t("form.submit")}
                        {!submitting && <ArrowRight className="w-4 h-4" />}
                      </button>
                      <a
                        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_DEFAULT)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-black/[0.10] text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {t("form.wa.direct")}
                      </a>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.06] py-14 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Logo className="h-12 w-auto mb-4" variant="horizontal" />
              <p className="text-xs text-gray-500 leading-relaxed">{t("footer.about")}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                {t("footer.contact")}
              </div>
              <div className="space-y-2">
                <a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-primary" /> WhatsApp Business
                </a>
                <a
                  href="tel:+13522462080"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-primary" /> (352) 246-2080
                </a>
                <a
                  href="mailto:customerservice@tissueprotech.com"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-primary" /> customerservice@tissueprotech.com
                </a>
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  Florida, United States of America
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                {t("footer.legal")}
              </div>
              <div className="space-y-2">
                <a
                  href="/page/privacy"
                  className="block text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {t("footer.privacy")}
                </a>
                <a
                  href="/page/terms"
                  className="block text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {t("footer.terms")}
                </a>
                <a
                  href="/page/disclaimer"
                  className="block text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {t("footer.disclaimer.link")}
                </a>
              </div>
            </motion.div>
          </div>
          <div className="pt-6 border-t border-black/[0.05] flex flex-col md:flex-row justify-between gap-3 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} TissuePro Teknologi Indonesia. All rights reserved.</p>
            <p className="font-bold uppercase tracking-wider">{t("footer.professional")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────

function Field({
  label,
  name,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white border border-black/10 text-gray-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-400"
      />
    </div>
  );
}
