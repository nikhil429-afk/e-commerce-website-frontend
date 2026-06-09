import { useState, useEffect, useRef } from 'react';
import { CartIcon, LazyLoading, LeftArrow, RightArrow, SearchIcon, StarIcon, WishlistIcon } from '../assets/Extra/svg';
import { fetchProducts, fetchWithAuth } from '../api/dashboard';
import { getTokenPayload, clearToken } from '../utils/tokenUtils';
import { StarRating } from '../assets/Extra/extra_functions';
import { useNavigate, Link } from 'react-router-dom';
import bed from "../assets/images/platform_bed.webp";
import chair from "../assets/images/living_room.jpg";
import almirah from "../assets/images/almirah.webp";
import dining from "../assets/images/dining.png";
import table from "../assets/images/table.jpg";
import sofa from "../assets/images/sofa.jpg"
import styles from './dashboard.module.css';
import BASE_URL from '../utils/baseapi';

interface Products {
  id: number;
  name: string;
  images: string[];
  category: string;
  price: number;
  oldPrice: number;
  tag: string;
  rating: number;
  description: string;
  in_stock: boolean;
}

const CATEGORIES = [
  { label: 'Sofas', src: sofa, to: '/products/sofas', count: '20+', desc: 'Comfort & Style' },
  { label: 'Beds', src: bed, to: '/products/beds', count: '15+', desc: 'Rest & Restore' },
  { label: 'Tables', src: table, to: '/products/tables', count: '18+', desc: 'Work & Dine' },
  { label: 'Chairs', src: chair, to: '/products/chairs', count: '25+', desc: 'Sit in Style' },
  { label: 'Almirahs', src: almirah, to: '/products/almirahs', count: '12+', desc: 'Store & Organise' },
  { label: 'Dining', src: dining, to: '/products/dinings', count: '10+', desc: 'Family Moments' },
];

function Dashboard() {
  const user = getTokenPayload();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const [search, setSearch] = useState('');
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [wished, setWished] = useState<Set<number>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
  const [currentIndexes, setCurrentIndexes] = useState<{ [key:number]: number }>({});

  const [showQuickView, setShowQuickView]  = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState<{msg: string, ok: boolean} | null>(null);

  const productsRef = useRef<HTMLElement | null>(null);


  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.trim()) {
      productsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const nextImage = (productId: number, total: number) => {
    setCurrentIndexes((prev) => ({ ...prev,
      [productId]: ((prev[productId] || 0) + 1) % total,
    }));
  };

  const prevImage = (productId: number, total: number) => {
    setCurrentIndexes((prev) => ({ ...prev, [productId]:
      ((prev[productId] || 0) - 1 + total) % total,
    }));
  };

  const openQuickView = (product: Products, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) { showToast("Please Login First!", false); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectedProduct(product);
    setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowQuickView(false); setSelectedProduct(null); setClosingModal(false);
    }, 350);
  };

  const detailView = () => {
    if (!user) { showToast("Please Login First!", false);
      return;
    }
    navigate("/products") 
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) { showToast("Please Login First!", false);
      return;
    }
    try {
      await fetchWithAuth(`/cart/${productId}`, { method: 'PUT' });
      setAddedToCart(productId);
      showToast("Product Added to Cart!");
      setTimeout(() => setAddedToCart(null), 1800);
    } catch (err) { console.error(err);
      showToast("Failed to Add to Cart", false);
     }
  };

  const toggleWishlist = async (productId: number) => {
    if (!user) { showToast("Please Login First!", false);
      return;
    }
    try {
      if (wished.has(productId)) {
        await fetchWithAuth(`/wishlist/${productId}`, { method: 'DELETE' });
        showToast("Product Removed from Wishlist!");
        setWished(prev => { const s = new Set(prev); s.delete(productId); return s; });
      } else {
        await fetchWithAuth(`/wishlist/${productId}`, { method: 'PUT' });
        showToast("Product Added to Wishlist!");
        setWished(prev => new Set(prev).add(productId));
      }
    } catch (err) { console.error(err);
      showToast("Failed to Update Wishlist", false); }
  };

  const confirmLogout = () => { clearToken(); setShowLogoutModal(false); navigate('/login'); };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const pct = (p: Products) =>
    p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

  return (
    <div className={styles.container}>
      <nav className={`${styles.navbar} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.logo} onClick={() => navigate('/')}>Furniture<span>·</span>Co</div>
        <ul className={styles.navLinks}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}> <SearchIcon /> </span>
          <input className={styles.search} placeholder="Search pieces…" value={search} onChange={(e) => handleSearch(e.target.value)}/>
        </div>

        <div className={styles.navActions}>
          <button className={styles.navCartBtn} onClick={() => navigate('/wishlist')} title="Wishlist"> <WishlistIcon/>
          </button>

          <button className={styles.navCartBtn} onClick={() => navigate('/cart')} title="Cart"> <CartIcon />
            {addedToCart && <span className={styles.cartBadge}>!</span>}
          </button>

          {user ? (
            <div className={styles.profileAvatar} title={user.username} onClick={() => setShowLogoutModal(true)}>
              {user.username?.slice(0, 2).toUpperCase()}
              <span className={styles.profileTooltip}>Click to sign out</span>
            </div>
          ) : (
            <>
              <button className={styles.navBtnOutline} onClick={() => navigate('/login')}>Sign In</button>
              <button className={styles.navBtnFill}    onClick={() => navigate('/register')}>Join</button>
            </>
          )}
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroBlob}  />
        <div className={styles.heroBlob2} />
        <div className={styles.ring1} />
        <div className={styles.ring2} />
        <div className={styles.ring3} />

        <div className={styles.heroContent}>
          <div className={styles.heroPill}> <StarIcon /> New Collection · 2025 </div>
          <h1>Crafted for<br /><em>Your Home</em></h1>
          <p>Pieces built to last generations — where timeless design meets the craft of dedicated artisans.</p>
          <div className={styles.heroCta}>
            <button className={styles.heroBtn} onClick={() => navigate('/products')}>
              <span>Explore Collection</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
            <button className={styles.heroBtnGhost} onClick={() => navigate('/about')}>Our Story</button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><span className={styles.heroStatNum}>15+</span><span className={styles.heroStatLabel}>Years of Craft</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><span className={styles.heroStatNum}>500+</span><span className={styles.heroStatLabel}>Unique Designs</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><span className={styles.heroStatNum}>12k+</span><span className={styles.heroStatLabel}>Happy Homes</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><span className={styles.heroStatNum}>10yr</span><span className={styles.heroStatLabel}>Warranty</span></div>
          </div>
        </div>

        <div className={styles.heroBadge}>Handcrafted in India</div>
        <div className={styles.scrollCue}>
          <div className={styles.scrollLine} />
          <span>Scroll</span>
        </div>
      </section>

      <section className={styles.categories}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>Browse For Room</p>
          <h2>Shop by Category</h2>
          <div className={styles.sectionLine} />
        </div>
        <div className={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <div key={cat.label} className={styles.categoryCard} onClick={() => navigate(cat.to)}>
              <div className={styles.categoryGlow} />
              <div className={styles.categoryCountBadge}>{cat.count}</div>
              <div className={styles.categoryIcon}>
                <img src={cat.src} alt={cat.label} />
              </div>
              <div className={styles.categoryLabel}>{cat.label}</div>
              <div className={styles.categoryDesc}>{cat.desc}</div>
              <div className={styles.categoryArrow}>→</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.products} ref={productsRef}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>Handpicked For You</p>
          <h2>Featured Pieces</h2>
          <div className={styles.sectionLine} />
        </div>

        {loading ? (
          <div className={styles.productGrid}>
            {[1, 2, 3].map(k => (
              <div key={k} className={`${styles.card} ${styles.cardSkeleton}`} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.noResults}>
            {search ? `No Results for "${search}"` : 'No Products Available Right Now.'}
          </div>
        ) : ( 
          <div className={styles.productGrid}>
            {filteredProducts.slice(0, 3).map(product => (
              <div key={product.id} className={styles.card}>
                {product.tag && <span className={styles.cardTag}>{product.tag}</span>}

                <button onClick={() => toggleWishlist(product.id)} title={wished.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`${styles.wishlistBtn} ${wished.has(product.id) ? styles.wishlistBtnActive : ''}`}>
                  {wished.has(product.id) ? '♥' : '♡'}
                </button>

                <div className={styles.cardImageWrap}>
                  {product.images
                    ? <img src={`${BASE_URL}${product.images[currentIndexes[product.id] || 0] || product.images[0] }`} alt={product.name} loading="lazy" />
                    : <div className={styles.cardImagePlaceholder}> <LazyLoading /> </div>
                  }
                  <div className={styles.cardImageOverlay}>
                    <button className={styles.quickView} onClick={e => openQuickView(product, e)}>Quick View</button>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <button className={styles.detailView} onClick={() =>{ detailView(); }}>Detail View</button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardCategoryLabel}>{product.category}</span>
                  </div>

                  <h3>{product.name}</h3>

                  <div className={styles.cardRating}>
                    <StarRating rating={product.rating || 4} />
                    <span className={styles.ratingVal}>{(product.rating || 4).toFixed(1)}</span>
                  </div>

                  <div className={styles.cardPriceRow}>
                    <span className={styles.cardPrice}>$ {Number(product.price).toLocaleString('en-IN')}</span>
                    {product.oldPrice > product.price && (
                      <span className={styles.cardOldPrice}>${Number(product.oldPrice).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <button onClick={() => handleAddToCart(product.id)}
                    disabled={!product.in_stock}
                    className={`${styles.cardBtn} ${addedToCart === product.id ? styles.cardBtnAdded : ''} ${!product.in_stock ? styles.cardBtnDisabled : ''}`}>
                    <span>
                      {addedToCart === product.id ? '✓ Added to Cart' : (
                        <>
                          <CartIcon /> {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {toast && (
          <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
            {toast.msg}
          </div>
        )}
        
        {showQuickView && selectedProduct && (
        <div className={styles.quickViewModal} onClick={closeQuickView}>
          <div onClick={e => e.stopPropagation()}
            className={`${styles.quickViewContent} ${closingModal ? styles.quickViewContentClosing : ''}`}
            style={{ '--origin-x': `${modalOrigin.x}px`, '--origin-y': `${modalOrigin.y}px` } as React.CSSProperties}>
            <button className={styles.closeBtn} onClick={closeQuickView}>✕</button>
            
            <div className={styles.quickViewImage}>
              <img src={`${BASE_URL}${selectedProduct.images[currentIndexes[selectedProduct.id] || 0] || selectedProduct.images[0]}`} alt={selectedProduct.name} />
              {selectedProduct.images.length > 1 && (
                <div className={styles.imageslider}>
                  <button onClick={(e) => { e.stopPropagation(); prevImage(selectedProduct.id, selectedProduct.images.length)}}><LeftArrow /></button>
                  <button onClick={(e) => { e.stopPropagation(); nextImage(selectedProduct.id, selectedProduct.images.length)}}><RightArrow /></button>
                </div>
              )}
              {selectedProduct.tag && <span className={styles.quickViewTag}>{selectedProduct.tag}</span>}
              <div className={styles.quickViewImageOverlay} />
            </div>
            <div className={styles.quickViewInfo}>
              <div className={styles.quickViewCategory}>{selectedProduct.category}</div>
              <div className={styles.quickViewTitle}>{selectedProduct.name}</div>

              <div className={styles.quickViewRating}>
                <StarRating rating={selectedProduct.rating || 4} />
                <span className={styles.quickViewRatingVal}>{(selectedProduct.rating || 4).toFixed(1)}</span>
              </div>

              <p className={styles.quickViewDesc}>{selectedProduct.description || 'A beautifully crafted piece designed to elevate your living space.'}</p>

              <div className={styles.quickViewPriceRow}>
                <span className={styles.quickViewPrice}>$ {selectedProduct.price?.toLocaleString('en-IN')}</span>
                {selectedProduct.oldPrice > selectedProduct.price && (
                  <>
                    <span className={styles.quickViewOldPrice}>${selectedProduct.oldPrice?.toLocaleString('en-IN')}</span>
                    <span className={styles.quickViewDiscountBadge}>-{pct(selectedProduct)}%</span>
                  </>
                )}
              </div>

              <div className={styles.quickViewStock}>
                {selectedProduct.in_stock ? <span className={styles.stockBadgeIn}>● In Stock</span> : <span className={styles.stockBadgeOut}>○ Out of Stock</span>}
              </div>

              <div className={styles.quickViewActions}>
                <button className={styles.quickViewCartBtn} disabled={!selectedProduct.in_stock}
                  onClick={() => { handleAddToCart(selectedProduct.id); closeQuickView(); }}>
                  <CartIcon />
                  <span>Add to Cart</span>
                </button>
                <button className={styles.quickViewWishBtn} onClick={() => toggleWishlist(selectedProduct.id)}>
                  {wished.has(selectedProduct.id) ? '♥' : '♡'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        <div className={styles.productsFooter}>
          <button className={styles.viewAllBtn} onClick={() => navigate('/products')}>
            <span>View Full Collection</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      <section className={styles.banner}>
        <div className={styles.bannerDecor} />
        <div className={styles.bannerContent}>
          <h2>Free Delivery Across India.<br />10-Year Warranty on Every Piece.</h2>
          <p>We stand behind every joint, finish, and grain we ship. White-glove delivery and full assembly included, because your home deserves nothing less.</p>
          <button onClick={() => navigate('/products')}>Shop the Collection →</button>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <h3>Furniture · Co.</h3>
            <p>Handcrafted furniture for homes that deserve better. Sustainable materials, generational quality.</p>
            <div className={styles.footerSocials}>
              <a className={styles.socialBtn} data-platform="instagram" href="https://www.instagram.com">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                <span>Instagram</span>
              </a>
              <a className={styles.socialBtn} data-platform="facebook" href="https://www.facebook.com">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>
          <div className={styles.footerCol}>
            <h4>Shop</h4>
            <ul>
              <li><a onClick={() => navigate('products/beds')}>Beds</a></li>
              <li><a onClick={() => navigate('products/sofas')}>Sofas</a></li>
              <li><a onClick={() => navigate('products/chairs')}>Chairs</a></li>
              <li><a onClick={() => navigate('products/tables')}>Tables</a></li>
              <li><a onClick={() => navigate('products/dinings')}>Dining</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Company</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Showroom</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Brands</h4>
            <ul>
              <li><Link to="/">Ikea</Link></li>
              <li><Link to="/">Supreme</Link></li>
              <li><Link to="/">Neelkamal</Link></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>© {new Date().getFullYear()} Furniture · Co. All rights reserved.</span>
          <div className={styles.footerDots}>
            <div className={styles.footerDot} />
            <div className={styles.footerDot} />
            <div className={styles.footerDot} />
          </div>
        </div>
      </footer>

      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', marginBottom: 8 }}>Sign out of your account?</p>
            <p style={{ fontSize: '0.82rem', opacity: 0.7, marginBottom: 0 }}>{user?.username}</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className={styles.confirmBtn} onClick={confirmLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Dashboard;
