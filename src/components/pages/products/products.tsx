import React, { useState, useEffect, useRef } from "react";
import { getAddToWishlist, getdetailView, getFetchCart, getProducts, getAddToCart } from "../../../api/products";
import { CartIcon, FooterLogo, TickMark, WishlistIcon } from "../../../assets/Extra/svg";
import { StarRating } from "../../../assets/Extra/extra_functions";
import PageNavigation from "../../pagenavigation/pagenavigation";
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getToken } from "../../../utils/tokenUtils";
import BASE_URL from "../../../utils/baseapi";
import styles from "./products.module.css";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

interface Products {
  id: number;
  name: string;
  category: string;
  images: string[];
  price: number;
  oldPrice: number;
  description: string;
  rating: number;
  tag: string;
  in_stock: boolean;
}

const heroImages = [
  {
    image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQfjKNV2_Vvi98UDsTB8BKofnVOlADWw0BRq6sQjiC3R9aP1v7XX4oKWU5E7Pfksz0wjMrUMRaGNVECDp4wViI75Mq_NhIRBNJMzCT7mnQ",
    name: "HeroImage1",
  },
  {
    image: "https://i.pinimg.com/1200x/12/b2/3c/12b23cfaf506649fe9a86f278aba7845.jpg",
    name: "HeroImage2",
  },
  {
    image: "https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?q=80&w=1206&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "HeroImage3",
  },
];

const testimonials = [
  {
    text: "The craftsmanship on my new dining set is incredible. Every detail is thoughtfully designed — exactly what I wanted for my home.",
    name: "Janae Randolph",
    image: "",
    rating: 4,
  },
  {
    text: "Amazing furniture quality and super-fast delivery. The sofa fits perfectly and looks even better in person. Highly recommended!",
    name: "Michael Smith",
    image: "",
    rating: 5,
  },
  {
    text: "The designs are modern and elegant. My living room feels completely transformed. Will definitely be ordering more.",
    name: "Sophia Johnson",
    image: "",
    rating: 5,
  },
];

const productList = [
  { name: "All Products", href: "/products" },
  { name: "Beds", href: "/products/beds" },
  { name: "Sofas", href: "/products/sofas" },
  { name: "Chairs", href: "/products/chairs" },
  { name: "Tables", href: "/products/tables" },
  { name: "Almirahs", href: "/products/almirahs" },
  { name: "Dining Tables", href: "/products/dinings" },
];

const FooterBrands = [
  { name: "Ikea", href: "sofas" },
  { name: "Supreme", href: "tables" },
  { name: "Neelkamal", href: "chairs" },
];

const FooterCategories = [
  { name: "Beds", href: "beds" },
  { name: "Sofas", href: "sofas" },
  { name: "Tables", href: "tables" },
  { name: "Dinings", href: "dinings" },
  { name: "Recliners", href: "chairs" },
  { name: "Sleeper Sofas", href: "sofas" },
];

const FooterSupport = [
  { name: "Feedback", href: "/contact" },
  { name: "Contact Us", href: "/contact" },
  { name: "Customer Support", href: "/contact" },
];

const normalizeCatName = (raw: string) => {
  if (raw === "dinings") return "Dining Tables";
  const map: Record<string, string> = {
    beds: "Beds", sofas: "Sofas", chairs: "Chairs", tables: "Tables", almirahs: "Almirahs",
  };
  return map[raw] || "All Products";
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handleClick = (page: number) => {
    if (page > 0 && page <= totalPages) onPageChange(page);
  };

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    const delta = 1;
    const left = currentPage - delta;
    const right = currentPage + delta;
    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button className={styles.pageNavBtn} onClick={() => handleClick(currentPage - 1)} disabled={currentPage === 1}>Prev.</button>
      {getPages().map((page, idx) =>
        page === "..." ? (
          <span key={`sep-${idx}`} className={styles.pageSep}>···</span>
        ) : (
          <button key={page} disabled={currentPage === page} onClick={() => handleClick(page as number)}
            className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}> {page}
          </button>
        )
      )}
      <button className={styles.pageNavBtn} onClick={() => handleClick(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};

function Products() {
  const token = getToken();
  const navigate = useNavigate();
  const activeCategory = normalizeCatName(window.location.pathname.split("/").pop() || "");

  const [activeCategoryState] = useState(productList);
  const [search, setSearch] = useState("");
  const [finalSearch, setFinalSearch] = useState("");

  const [cart, setCart] = useState<number[]>([]);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [products, setProducts] = useState<Products[]>([]);
  const [currentIndexes, setCurrentIndexes] = useState<{ [key: number]: number }>({});

  const [showQuickView, setShowQuickView] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [showDetailView, setShowDetailView] = useState(false);

  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [totalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeHeroImages, setActiveHeroImages] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const productsRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const pct = (i: Products) => i.oldPrice > 0 ? Math.round(((i.oldPrice - i.price) / i.oldPrice) * 100) : 0;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollToSubRoute = () => window.scrollTo({ top: 380, behavior: "smooth" });

  useEffect(() => {
    if (token) fetchCart();
  }, [token]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
        setProducts(res.map((item: any) => ({
          ...item,
          oldPrice: item.old_price ?? item.oldPrice ?? 0,
        })));
      } catch {
        showToast("Error fetching products.", false);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeroImages(prev => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const nextImage = (productId: number, total: number) =>
    setCurrentIndexes(prev => ({ ...prev, [productId]: ((prev[productId] || 0) + 1) % total }));

  const prevImage = (productId: number, total: number) =>
    setCurrentIndexes(prev => ({ ...prev, [productId]: ((prev[productId] || 0) - 1 + total) % total }));

  const handleSearch = (value: string) => {
    setSearch(value);
    setFinalSearch(value);
    if (value.trim()) {
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const quickView = (product: Products, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!token) { showToast("Please log in to View Product Details.", false); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectedProduct(product);
    setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setClosingModal(true);
    setTimeout(() => { setShowQuickView(false); setSelectedProduct(null); setClosingModal(false); }, 350);
  };

  const detailView = async (product: Products) => {
    if (!token) {
      showToast("Please log in to View Product Details.", false);
    }
    try {
      const res = await getdetailView(product.id);
      setSelectedProduct({ ...res, oldPrice: res.old_price ?? res.oldPrice ?? 0 });
      setShowDetailView(true);
      navigate(`/products/${product.id}/detailview`);
    } catch {
      showToast("Error fetching product details.", false);
    }
  };

  const fetchCart = async () => {
    try {
      if (!token) return;
      const data = await getFetchCart(token);
      if (!Array.isArray(data)) return;
      setCart(data.map((item: any) => item.product_id));
    } catch {}
  };

  const addToCart = async (productId: number) => {
    if (!token) { showToast("Please Log in to Add items to your Cart.", false); return; }
    try {
      const res = await getAddToCart(productId, token);
      if (!res) { showToast("Could not add item to cart.", false); return; }
      await fetchCart();
      setAddedToCart(productId);
      setTimeout(() => setAddedToCart(null), 3000);
    } catch {
      showToast("Error Adding item to Cart.", false);
    }
  };

  const addToWishList = async (productId: number) => {
    if (!token) { showToast("Please Log in to save to your Wishlist.", false); return; }
    try {
      const res = await getAddToWishlist(productId, token);
      if (!res) { showToast("Could not add item to wishlist.", false); return; }
      setWishlist(prev => prev.includes(productId) ? prev : [...prev, productId]);
      showToast("Added to Wishlist!", true);
    } catch {
      showToast("Error Adding Item to Wishlist.", false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(finalSearch.toLowerCase())
  );

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingSpinner} />
      <span>Loading Products…</span>
    </div>
  );

  return (
    <>
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo}>Furni<span>ture</span></Link>&nbsp;
        <PageNavigation />
        <ul className={styles.navLinks}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products" onClick={scrollToTop}>Products</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <div className={styles.navIcons}>
          <div className={styles.searchWrap}>
            <input type="text" placeholder="Search products…" value={search} className={styles.search} onChange={e => handleSearch(e.target.value)} />
          </div>

          <button className={styles.iconBtn} title="Wishlist" onClick={() => navigate("/wishlist")}>
            {wishlist.length > 0 && <span className={styles.cartBadge}>{wishlist.length}</span>}
            <WishlistIcon />
          </button>

          <button className={styles.iconBtn} title="Cart" onClick={() => navigate("/cart")}>
            {cart.length > 0 && <span className={styles.cartBadge}>{cart.length}</span>}
            <CartIcon />
          </button>
        </div>
      </nav>

      <div className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.heroSubtitle}>
            {activeCategory === "All Products" ? "Explore Our Full Range" : `Browsing ${activeCategory}`}
          </div>
          <h1>{activeCategory === "All Products" ? "Our Products" : activeCategory}</h1>
          <p className={styles.heroDesc}>Premium Furniture Crafted for Modern Living — Quality that Lasts.</p>
        </div>

        <div className={styles.heroImageWrapper}>
          {heroImages.map((img, index) => (
            <img key={index} src={img.image} alt={img.name} className={`${styles.heroImage} ${index === activeHeroImages ? styles.activeHero : ""}`} />
          ))}
        </div>
      </div>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarBlock}>
            <h3>All Categories</h3>
            <ul onClick={scrollToSubRoute}>
              {productList.map(cat => {
                const isActive =
                  activeCategory === cat.name ||
                  (cat.name === "Dining Tables" && activeCategory === "Dining Tables");
                return (
                  <li key={cat.name} className={isActive ? styles.active : ""}>
                    {isActive && <span className={styles.activeCaret}>›</span>}
                    <Link to={cat.href}>{cat.name}</Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.sideBanner}>
            <div className={styles.sideBannerLabel}>Decorate Your Room</div>
            <h3>With <span>&nbsp;AI</span></h3>
            <button className={styles.sideBannerBtn} onClick={() => navigate("/ai-decorate")}>Let's Go →</button>
            <img src="https://blog.pincel.app/wp-content/uploads/2024/04/decorate-after.jpg"
              alt="Decorate with AI" className={styles.sideBannerImage} />
          </div>
        </aside>

        <div ref={productsRef} className={styles.productArea}>
          {activeCategoryState && (<>
            <Outlet />
            <br />
              <div className={styles.grid}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div key={product.id} className={styles.card}>
                      {product.tag && <div className={styles.cardTag}>{product.tag}</div>}
                      <button className={styles.wishlistBtn} onClick={() => addToWishList(product.id)}>♡ Wishlist</button>

                      <div className={styles.imageWrap}>
                        <img src={`${BASE_URL}${product.images[currentIndexes[product.id] || 0] || product.images[0]}`}
                          alt={product.name} loading="lazy" />
                        <div className={styles.imageOverlay}>
                          <button className={styles.quickViewBtn} onClick={e => quickView(product, e)}>Quick View</button>
                          <button className={styles.detailViewBtn} onClick={() => detailView(product)}>Details</button>
                        </div>
                      </div>

                      <div className={styles.cardBody}>
                        <div className={styles.rating}>
                          <StarRating rating={product.rating} />
                          <span className={styles.ratingCount}>{product.rating}</span>
                        </div>

                        <h3 className={styles.title}>{product.name}</h3>
                        <p className={`${styles.titleh2} ${product.in_stock ? styles.inStock : styles.outStock}`}>
                          {product.in_stock ? "● In Stock" : "○ Out of Stock"}
                        </p>

                        <div className={styles.priceRow}>
                          <span className={styles.price}>₹{product.price.toLocaleString()}</span>
                          {product.oldPrice > 0 && (
                            <span className={styles.oldPrice}>₹{product.oldPrice.toLocaleString()}</span>
                          )}
                          {pct(product) > 0 && (
                            <span className={styles.discount}>-{pct(product)}%</span>
                          )}
                        </div>

                        <button className={styles.button} disabled={!product.in_stock}
                          onClick={e => { e.stopPropagation(); addToCart(product.id); }}>
                          {addedToCart === product.id ? (
                            <><TickMark /><span>&nbsp;Added!</span></>
                          ) : (
                            <span><CartIcon />&nbsp;{product.in_stock ? "Add to Cart" : "Out of Stock"}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noResults}>No products found for "{finalSearch}".</p>
                )}
              </div>
            </>
          )}

          {showQuickView && selectedProduct && (
            <div className={styles.quickViewModal} onClick={closeQuickView}>
              <div className={`${styles.quickViewContent} ${closingModal ? styles.quickViewContentClosing : ""}`} onClick={e => e.stopPropagation()}
                style={{ "--origin-x": `${modalOrigin.x}px`, "--origin-y": `${modalOrigin.y}px` } as React.CSSProperties}>
                <button className={styles.closeBtn} onClick={closeQuickView}>✕</button>

                <div className={styles.quickViewImage}>
                  <img src={`${BASE_URL}${selectedProduct.images[currentIndexes[selectedProduct.id] || 0] || selectedProduct.images[0]}`}
                    alt={selectedProduct.name} />
                  {selectedProduct.images.length > 1 && (
                    <div className={styles.imageslider}>
                      <button onClick={e => { e.stopPropagation(); prevImage(selectedProduct.id, selectedProduct.images.length); }}>◀</button>
                      <button onClick={e => { e.stopPropagation(); nextImage(selectedProduct.id, selectedProduct.images.length); }}>▶</button>
                    </div>
                  )}
                  {selectedProduct.tag && <span className={styles.quickViewTag}>{selectedProduct.tag}</span>}
                  <div className={styles.quickViewImageOverlay} />
                </div>

                <div className={styles.quickViewInfo}>
                  <div className={styles.quickViewCategory}>{selectedProduct.category}</div>
                  <h2 className={styles.quickViewTitle}>{selectedProduct.name}</h2>

                  <div className={styles.quickViewRating}>
                    {"★".repeat(selectedProduct.rating)}{"☆".repeat(5 - selectedProduct.rating)}
                    <span className={styles.quickViewRatingVal}>{selectedProduct.rating}.0</span>
                  </div>

                  <p className={styles.quickViewDesc}>{selectedProduct.description}</p>

                  <div className={styles.quickViewPriceRow}>
                    <span className={styles.quickViewPrice}>₹{selectedProduct.price.toLocaleString()}</span>
                    {selectedProduct.oldPrice > 0 && (
                      <span className={styles.quickViewOldPrice}>₹{selectedProduct.oldPrice.toLocaleString()}</span>
                    )}
                  </div>

                  <div className={styles.quickViewStock}>
                    <span className={selectedProduct.in_stock ? styles.stockBadgeIn : styles.stockBadgeOut}>
                      {selectedProduct.in_stock ? "● In Stock" : "○ Out of Stock"}
                    </span>
                  </div>

                  <div className={styles.quickViewActions}>
                    <button className={styles.quickViewCartBtn} disabled={!selectedProduct.in_stock}
                      onClick={() => { addToCart(selectedProduct.id); closeQuickView(); }}>
                      <WishlistIcon /> &nbsp; Add to Cart
                    </button>
                    <button className={styles.quickViewWishBtn} onClick={() => addToWishList(selectedProduct.id)}>♡</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showDetailView && selectedProduct && <div />}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      <section className={styles.testimonialSection}>
        <div className={styles.testimonialContent}>
          <div className={styles.quoteIcon}>"</div>
          <p className={styles.testimonialText}>{testimonials[activeTestimonial].text}</p>
          <div className={styles.quoteIcon}>"</div>

          <div className={styles.testimonialAuthor}>
            <img src={testimonials[activeTestimonial].image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(testimonials[activeTestimonial].name) + "&background=ff7a00&color=fff&size=46"}
              alt={testimonials[activeTestimonial].name} className={styles.authorAvatar} />
            <div>
              <div className={styles.authorName}>{testimonials[activeTestimonial].name}</div>
              <div className={styles.authorStars}>
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <span key={i} className={styles.starFilled}>★</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.testimonialDots}>
          {testimonials.map((_, i) => (
            <div key={i} onClick={() => setActiveTestimonial(i)} className={`${styles.dot} ${i === activeTestimonial ? styles.activeDot : ""}`} />
          ))}
        </div>
      </section>

      {toast && (
        <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
          {toast.msg}
        </div>
      )}

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerCol} />
          <div className={styles.footerCol}>
            <h4>Brands</h4>
            <ul onClick={scrollToSubRoute}>
              {FooterBrands.map(l => (
                <li key={l.name}><Link to={l.href}>{l.name}</Link></li>
              ))}
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4 onClick={scrollToTop} style={{ cursor: "pointer" }}>Categories</h4>
            <ul onClick={scrollToSubRoute}>
              {FooterCategories.map(l => (
                <li key={l.name}><Link to={l.href}>{l.name}</Link></li>
              ))}
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Support</h4>
            <ul>
              {FooterSupport.map(l => (
                <li key={l.name}><Link to={l.href}>{l.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <Link to="/" className={styles.footerLogo}>
            <FooterLogo /> Furni<span>ture</span>
          </Link>
          <div className={styles.social_list} />
        </div>
      </footer>
    </div></>
  );
}


export default Products;
