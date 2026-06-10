import { addToCart, getSofas } from "../../../../api/Product_items_API/sofa";
import { StarRating } from "../../../../assets/Extra/extra_functions";
import { CartIcon, TickMark } from "../../../../assets/Extra/svg";
import { addToWishlist } from "../../../../api/wishlist";
import { getToken } from "../../../../utils/tokenUtils";
import { getProducts } from "../../../../api/products";
import React, { useState, useEffect } from "react";
import BASE_URL from "../../../../utils/baseapi";
import { Link } from "react-router-dom";
import styles from "./items.module.css";

interface Sofa {
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
};

function Sofas() {

  const token = getToken();

  const [, setShowTokenExpired] = useState(false);
  const [wished, setWished] = useState<Set<number>>(new Set());
  const [products, setProducts] = useState<Sofa[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [allLoading, setAllLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [currentIndexes, setCurrentIndexes] = useState<{ [key:number]: number }>({});
  const [selectedProduct, setSelectedProduct] = useState<Sofa | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({x: window.innerWidth/2, y: window.innerHeight/2,});
  const [loading, setLoading] = useState<boolean>(true);
  const [, setWishlist] = useState<number[]>([]);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [toast, setToast] = useState<{msg: string, ok: boolean} | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getSofas();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({msg, ok});
    setTimeout(() => setToast(null), 4000);
  };

  const handleShowAll = async () => {
    setShowAllOpen(prev => !prev);
    if (!allLoaded) {
      setAllLoading(true);
      try {
        const data = await getProducts();
        setAllProducts(Array.isArray(data) ? data : []);
        setAllLoaded(true);
      } catch (err) {
        console.error("Error fetching all products:", err);
      } finally {
        setAllLoading(false);
      }
    }
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

  const quickView = (productId: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if(!token){ showToast("Please Login First!", false); return; }
    const product = products.find((p) => p.id === productId);
    const rect = e.currentTarget.getBoundingClientRect();
    if (product) {
      setSelectedProduct(product);
      setModalOrigin({x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,});
      setShowQuickView(true);
    }
  };

  const closeQuickView = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowQuickView(false);
      setSelectedProduct(null);
      setClosingModal(false);
    }, 350);
  };

  const handleAddToWishlist = async (productId: number) => {
    try {
      if (!token) { showToast("Please Login First!", false);
        if (localStorage.getItem("auth_token")) { setShowTokenExpired(true); } return;
      }
      const res = await addToWishlist(productId);
      if (!res.ok) { showToast("Failed to Add this Item to Wishlist", false); return; }
      setWishlist(prev => [...prev, productId]);
      setWished(prev => {
        const next = new Set(prev);
        next.has(productId) ? next.delete(productId) : next.add(productId);
        return next;
      });
      showToast("Item Added to Wishlist Successfully!", true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToCart = async (product: Sofa) => {
    try {
      if (!token) { showToast("Please Login First!", false);
        if (localStorage.getItem("auth_token")) { setShowTokenExpired(true); } return;
      }
      const res = await addToCart(product);
      const data = await res.json();
      if (!res.ok) { showToast("Failed to add to cart", false); return; }
      setAddedToCart(product.id);
      setTimeout(() => setAddedToCart(null), 5000);
    } catch (err) {
      showToast("An error occurred while adding to cart", false);
    }
  };

  const pct = (i: Sofa) => Math.round(((i.oldPrice - i.price) / i.oldPrice) * 100);
  const filtered = products;

  if (loading) return <h2 className={styles.loading}>Loading Products....</h2>;
  if (!products.length) return <h2 className={styles.notFound}>No Product Found!</h2>;

  return (
    <div className={styles.container}>
      <div className={styles.heroBanner}>
        <div className={styles.breadcrumb}>
          <Link to="/products">Products</Link>
          <span>›</span>
          <span style={{ color: '#c28246' }}>Sofas & Sectionals</span>
        </div>
        <div className={styles.heroText}>
          <div className={styles.eyebrow}>✦ 2025 Collection</div>
          <h1 className={styles.heading}>Sofas &amp; <em>Sectionals</em></h1>
          <p className={styles.subheading}>Crafted For Comfort. Designed For Life.</p>
        </div>
        {products.length > 0 && (
          <div className={styles.heroCountBadge}>{products.length} Pieces Available</div>
        )}
      </div>

      <div className={styles.categorySeparator} />

      <div className={styles.grid}>
        {filtered.map(sofa => (
          <div key={sofa.id} className={styles.card}>
            <button className={styles.wishBtn} onClick={() => handleAddToWishlist(sofa.id)} title="Wishlist">
              {wished.has(sofa.id) ? "♥" : "♡"}
            </button>
            <div className={styles.imageWrap}>
              <img src={`${BASE_URL}${sofa.images[currentIndexes[sofa.id] || 0] || sofa.images[0]}`} alt={sofa.name} loading="lazy" />
              <div className={styles.imageOverlay}>
                <button className={styles.quickViewBtn} onClick={(e) => {quickView(sofa.id, e)}}>Quick View</button>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.rating}>
                <StarRating rating={sofa.rating} />
                <span className={styles.ratingCount}>{`${sofa.rating}`}</span>
              </div>
              <h3 className={styles.title}>{sofa.name}</h3>
              <p className={`${styles.titleh2} ${sofa.in_stock ? styles.inStock : styles.outStock}`}>
                {sofa.in_stock ? '● In Stock' : '○ Out of Stock'}
              </p>
              <div className={styles.priceRow}>
                <span className={styles.price}>$ {sofa.price}.00</span>
                <span className={styles.oldPrice}>$ {sofa.oldPrice}.00</span>
                {pct(sofa) > 0 && (<span className={styles.discount}>-{pct(sofa)}%</span>)}
              </div>
              <button className={styles.button} disabled={!sofa.in_stock} onClick={() => {handleAddToCart(sofa);}}>
                {addedToCart === sofa.id ? (
                  <><TickMark /><span>Added To Cart!</span></>
                ) : (
                  <><span><CartIcon />&nbsp; {sofa.in_stock ? 'Add to Cart' : 'Out of Stock'}</span></>
                )}
              </button>
            </div>
          </div>
        ))}
        {toast && (
          <div className={`${styles.toast} ${toast.ok ? styles.toastSuccess : styles.toastError}`}>
            {toast.msg}
          </div>
        )}
        {showQuickView && selectedProduct && (
          <div className={styles.quickViewModal} onClick={closeQuickView}>
            <div className={`${styles.quickViewContent} ${closingModal ? styles.quickViewContentClosing : ""}`}
              style={{"--origin-x": `${modalOrigin.x}px`, "--origin-y": `${modalOrigin.y}px`,} as React.CSSProperties}
              onClick={e => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={closeQuickView}>✕</button>
              <div className={styles.quickViewImage}>
                <img src={`${BASE_URL}${selectedProduct.images[currentIndexes[selectedProduct.id] || 0] || selectedProduct.images[0]}`} alt={selectedProduct.name} />
                {selectedProduct.images.length > 1 && (
                  <div className={styles.imageslider}>
                    <button onClick={(e) => { e.stopPropagation(); prevImage(selectedProduct.id, selectedProduct.images.length)}}>◀</button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage(selectedProduct.id, selectedProduct.images.length)}}>▶</button>
                  </div>
                )}
                {selectedProduct.tag && (<span className={styles.quickViewTag}>{selectedProduct.tag}</span>)}
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
                  <span className={styles.quickViewPrice}>${selectedProduct.price}.00</span>
                  {selectedProduct.oldPrice && (<span className={styles.quickViewOldPrice}>${selectedProduct.oldPrice}.00</span>)}
                </div>
                <div className={styles.quickViewStock}>
                  <span className={selectedProduct.in_stock ? styles.stockBadgeIn : styles.stockBadgeOut}>
                    {selectedProduct.in_stock ? "● In Stock" : "○ Out of Stock"}
                  </span>
                </div>
                <div className={styles.quickViewActions}>
                  <button className={styles.quickViewCartBtn} disabled={!selectedProduct.in_stock}
                    onClick={() => {handleAddToCart(selectedProduct); closeQuickView();}}>
                    <CartIcon /> &nbsp;Add to Cart
                  </button>
                  <button className={styles.quickViewWishBtn} onClick={() => handleAddToWishlist(selectedProduct.id)}>♡</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.showAllSection}>
        <div className={styles.showAllLeft}>
          <span className={styles.showAllLabel}>Explore More</span>
          <h3 className={styles.showAllTitle}>Browse Our Full Collection</h3>
        </div>
        <button className={styles.showAllBtn} onClick={handleShowAll}>
          {showAllOpen ? 'Hide All Products' : 'Show All Products'}
          <span className={`${styles.caretIcon} ${showAllOpen ? styles.caretOpen : ''}`}>▼</span>
        </button>
      </div>

      <div className={`${styles.allProductsPanel} ${showAllOpen ? styles.allProductsPanelOpen : ''}`}>
        <div className={styles.sectionDivider}>
          <span className={styles.sectionDividerLabel}>All Products</span>
        </div>
        <div className={styles.allProductsGrid}>
          {allLoading ? (
            <div className={styles.panelLoading}>Loading all products…</div>
          ) : allProducts.length > 0 ? (
            allProducts.map((product: any) => (
              <div key={product.id} className={styles.card}>
                {product.tag && <div className={styles.badge}>{product.tag}</div>}
                <button className={styles.wishBtn} onClick={() => handleAddToWishlist(product.id)}>♡</button>
                <div className={styles.imageWrap}>
                  <img
                    src={`${BASE_URL}${product.images?.[0] || ''}`}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.rating}>
                    <StarRating rating={product.rating} />
                    <span className={styles.ratingCount}>{product.rating}</span>
                  </div>
                  <h3 className={styles.title}>{product.name}</h3>
                  <p className={`${styles.titleh2} ${product.in_stock ? styles.inStock : styles.outStock}`}>
                    {product.in_stock ? '● In Stock' : '○ Out of Stock'}
                  </p>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>$ {product.price}.00</span>
                    {product.oldPrice && <span className={styles.oldPrice}>$ {product.oldPrice}.00</span>}
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className={styles.discount}>-{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%</span>
                    )}
                  </div>
                  <button className={styles.button} disabled={!product.in_stock} onClick={() => handleAddToCart(product)}>
                    {addedToCart === product.id ? (
                      <><TickMark /><span>Added!</span></>
                    ) : (
                      <><CartIcon />&nbsp; {product.in_stock ? 'Add to Cart' : 'Out of Stock'}</>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : allLoaded ? (
            <div className={styles.panelLoading}>No products found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


export default Sofas;
