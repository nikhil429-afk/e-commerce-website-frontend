import { useState, useEffect, useRef } from 'react';
import { CartIcon, FacebookIcon, InstagramIcon, LazyLoading, LeftArrow, RightArrow, RightBigArrow, StarIcon } from '../assets/Extra/svg';
import { fetchProducts, getFetchCart, getAddToCart, getAddToWishlist, getFetchWishlist } from '../api/dashboard';
import { getTokenPayload, getToken } from '../utils/tokenUtils';
import { StarRating } from '../assets/Extra/extra_functions';
import { useNavigate, Link } from 'react-router-dom';
import bed from "../assets/images/platform_bed.webp";
import chair from "../assets/images/chair.avif";
import almirah from "../assets/images/almirah.webp";
import dining from "../assets/images/dining.png";
import table from "../assets/images/table.jpg";
import sofa from "../assets/images/sofa.jpg"
import styles from './dashboard.module.css';
import BASE_URL from '../utils/baseapi';
import { useCenterFocus } from '../utils/useCenterFocus';
import Navbar from '../components/navbar/Navbar';

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
  { label: 'Beds', src: bed, to: '/products/beds', count: '15+', desc: 'Rest & Restore' },
  { label: 'Tables', src: table, to: '/products/tables', count: '18+', desc: 'Work & Dine' },
  { label: 'Chairs', src: chair, to: '/products/chairs', count: '25+', desc: 'Sit in Style' },
  { label: 'Sofas', src: sofa, to: '/products/sofas', count: '20+', desc: 'Comfort & Style' },
  { label: 'Dining', src: dining, to: '/products/dinings', count: '10+', desc: 'Family Moments' },
  { label: 'Almirahs', src: almirah, to: '/products/almirahs', count: '12+', desc: 'Store & Organise' },
];

function Dashboard() {
  const token = getToken();
  const user = getTokenPayload();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Products[]>([]);

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<number[]>([]);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
  const [currentIndexes, setCurrentIndexes] = useState<{ [key:number]: number }>({});

  const [closingModal, setClosingModal] = useState(false);
  const [showQuickView, setShowQuickView]  = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });

  const [toast, setToast] = useState<{msg: string, ok: boolean} | null>(null);


  const productsRef = useRef<HTMLElement | null>(null);

  useCenterFocus(`${products.length}-${search}`);


  useEffect(() => {
    fetchCart(); fetchWishlist();
    fetchProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.trim()) {
      productsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  };

  const scrollToSubRoute = () => window.scrollTo({ top: 380, behavior: "smooth" });

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

  const fetchCart = async () => {
    try {
      if (!token) return;
      const data = await getFetchCart(token);
      if (!Array.isArray(data)) return;
      setCart(data.map((item: any) => item.product_id));
    } catch {}
  };

  const addToCart = async (productId: number) => {
    if (!token) { showToast("Please Log in to Add items to your Cart.", false);
      return;
    }
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

  const fetchWishlist = async () => {
    try {
      if (!token) return;
      const data = await getFetchWishlist(token);
      if (!Array.isArray(data)) return;
      setWishlist(data.map((item: any) => item.product_id));
    } catch {}
  };

  const addToWishList = async (productId: number) => {
    if (!token) { showToast("Please Log in to save to your Wishlist.", false);
      return;
    }
    try {
      const res = await getAddToWishlist(productId, token);
      if (!res) { showToast("Could not add item to wishlist.", false);
        return;
      }
      await fetchWishlist();
      setWishlist(prev => prev.includes(productId) ? prev : [...prev, productId]);
      showToast("Added to Wishlist!", true);
    } catch {
      showToast("Error Adding Item to Wishlist.", false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const percent = (p: Products) =>
    p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

  return (
    <div className={styles.container}>
      <Navbar
        cartCount={cart.length}
        wishlistCount={wishlist.length}
        search={{ value: search, onChange: handleSearch, placeholder: 'Search pieces…' }}
      />

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
            <div key={cat.label} className={styles.categoryCard} onClick={() => {navigate(cat.to); scrollToSubRoute(); }}>
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
              <div key={product.id} className={styles.card} data-focus-card>
                {product.tag && <span className={styles.cardTag}>{product.tag}</span>}

                <button onClick={() => addToWishList(product.id)} className={styles.wishlistBtn}>
                  ♡ Wishlist
                </button>

                <div className={styles.cardImageWrap}>
                  {product.images
                    ? <img src={`${BASE_URL}${product.images[currentIndexes[product.id] || 0] || product.images[0] }`} alt={product.name} loading="lazy" />
                    : <div className={styles.cardImagePlaceholder}> <LazyLoading /> </div>
                  }
                  <div className={styles.cardImageOverlay}>
                    <button className={styles.quickView} onClick={e => openQuickView(product, e)}>Quick View</button>
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
                  <button onClick={() => addToCart(product.id)}
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
                    <span className={styles.quickViewDiscountBadge}>-{percent(selectedProduct)}%</span>
                  </>
                )}
              </div>

              <div className={styles.quickViewStock}>
                {selectedProduct.in_stock ? <span className={styles.stockBadgeIn}>● In Stock</span> : <span className={styles.stockBadgeOut}>○ Out of Stock</span>}
              </div>

              <div className={styles.quickViewActions}>
                <button className={styles.quickViewCartBtn} disabled={!selectedProduct.in_stock}
                  onClick={() => { addToCart(selectedProduct.id); closeQuickView(); }}>
                  <CartIcon />
                  <span>Add to Cart</span>
                </button>
                <button className={styles.quickViewWishBtn} onClick={() => addToWishList(selectedProduct.id)}>
                  ♡ Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        <div className={styles.productsFooter}>
          <button className={styles.viewAllBtn} onClick={() => navigate('/products')}>
            <span>View Full Collection</span>
            <RightBigArrow />
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
            <p>Handcrafted furniture for homes that deserve better. Sustainable Materials, Generational Quality.</p>
            <div className={styles.footerSocials}>
              <a className={styles.socialBtn} data-platform="instagram" href="https://www.instagram.com/raj.furniture98?igsh=MjllN2t1MDR2cmZw">
                <InstagramIcon /><span>Instagram</span>
              </a>
              <a className={styles.socialBtn} data-platform="facebook" href="https://www.facebook.com/">
                <FacebookIcon /><span>Facebook</span>
              </a>
            </div>
          </div>
          <div className={styles.footerCol}>
            <h4>Shop</h4>
            <ul>
              <li><a onClick={() => {navigate('products/beds'); scrollToSubRoute();}}>Beds</a></li>
              <li><a onClick={() => {navigate('products/sofas'); scrollToSubRoute();}}>Sofas</a></li>
              <li><a onClick={() => {navigate('products/chairs'); scrollToSubRoute();}}>Chairs</a></li>
              <li><a onClick={() => {navigate('products/tables'); scrollToSubRoute();}}>Tables</a></li>
              <li><a onClick={() => {navigate('products/dinings'); scrollToSubRoute();}}>Dining</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Company</h4>
            <ul>
              <li onClick={() => { scrollToTop(); }}><Link to="/">Home</Link></li>
              <li><Link to="/products" onClick={() => scrollToSubRoute()}>Products</Link></li>
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
        </div>
      </footer>

    </div>
  );
}


export default Dashboard;
