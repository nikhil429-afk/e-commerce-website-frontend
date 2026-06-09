import { useState, useEffect } from "react";
import styles from "./items.module.css";
import { addToCart, addToWishlist, getBeds } from "../../../../api/Product_items_API/beds";
import { getToken } from "../../../../utils/tokenUtils";
import { StarRating } from "../../../../assets/Extra/extra_functions";
import { CartIcon, TickMark } from "../../../../assets/Extra/svg";
import BASE_URL from "../../../../utils/baseapi";


interface Bed {
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


function Beds() {
  
  const token = getToken();

  const [, setShowTokenExpired] = useState(false);

  const [activeFilter, ] = useState("All");
  const [wished, setWished] = useState<Set<number>>(new Set());
  const [products, setProducts] = useState<Bed[]>([]);
  const [currentIndexes, setCurrentIndexes] = useState<{ [key:number]: number }>({});
  const [selectedProduct, setSelectedProduct] = useState<Bed | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({x: window.innerWidth/2, y: window.innerHeight/2,});
  const [loading, setLoading] = useState<boolean>(true);
  const [, setWishlist] = useState<number[]>([]);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getBeds();
        console.log("Fetched Data:", data);
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  const quickView = (productId: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if(!token){ showToast("Please Login First!", false);
      return;
    }
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

  const handleAddToWishList = async (product: Bed) => {
    try {
      if (!token) { showToast("Please Login First!", false);
        if (localStorage.getItem("auth_token")) { setShowTokenExpired(true); } return;
      }
      const res = await addToWishlist(product.id);
      if (!res.ok) { showToast("Failed to Add this Item to Wishlist", false); return; }
      setWishlist(prev => [...prev, product.id]);
      setWished(prev => {
        const next = new Set(prev);
        next.has(product.id) ? next.delete(product.id) : next.add(product.id);
        return next;
      });
      showToast("Item Added to Wishlist Successfully!", true);
    } catch (error) {
      console.error(error);
    }
  };

  
  const handleAddToCart = async (product: Bed) => {
    try {
      if (!token) { showToast("Please Login First!", false);
        if (localStorage.getItem("auth_token")) { setShowTokenExpired(true); } return;
      }
      const res = await addToCart(product);
      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        showToast("Failed to add to cart", false);
        return;
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while adding to cart", false);
    }
  };

  const handleaddToCart = (id: number) => {
    setAddedToCart(id);
    setTimeout(() => setAddedToCart(null), 3000);
  };

  const filtered = activeFilter === "All" ? products : products.filter( s => s.category === activeFilter || (activeFilter === "Premium" && s.price >= 250));
  const pct = (i: Bed) => {
    if (!i.oldPrice || i.oldPrice <= i.price) return 0;
    return Math.round(
      ((i.oldPrice - i.price) / i.oldPrice) * 100
    );
  };
  
    if (loading) return <h2 className={styles.loading}>Loading Products....</h2>;
    if (!products.length) return <h2 className={styles.notFound}>No Product Found!</h2>;

  return (
    <div className={styles.container}>
      <div className={styles.heroBanner}>
        <div className={styles.heroText}>
          <div className={styles.eyebrow}>✦ 2025 Collection</div>
          <h1 className={styles.heading}>Beds &amp; <em>Frames</em></h1>
          <p className={styles.subheading}>Crafted for comfort. Designed for life.</p>
        </div>
      </div>

      <div className={styles.grid}>
        {(filtered || []).map(bed => (
          <div key={bed?.id} className={styles.card}>
            <button className={styles.wishBtn} onClick={() => handleAddToWishList(bed)} title="Wishlist"> {wished.has(bed.id) ? "♥" : "♡"}</button>
            <div className={styles.imageWrap}>
              <img src={`${BASE_URL}${bed.images[currentIndexes[bed.id] || 0] || bed.images[0] }`} alt={bed.name} loading="lazy" />
              <div className={styles.imageOverlay}>
              <button className={styles.quickViewBtn} onClick={(e) => {quickView(bed?.id, e)}}>Quick View</button>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.rating}>
                <StarRating rating={bed?.rating} />
                <span className={styles.ratingCount}>{`${bed?.rating}`}</span>
              </div>
              <h3 className={styles.title}>{bed?.name}</h3>
              <p className={`${styles.titleh2} ${bed.in_stock ? styles.inStock : styles.outStock}`}>
                {bed.in_stock ? '● In Stock' : '○ Out of Stock'}
              </p>

              <div className={styles.priceRow}>
                <span className={styles.price}>${bed?.price}.00</span>
                <span className={styles.oldPrice}>$ {bed?.oldPrice}.00</span>
                {pct(bed) > 0 && (
                  <span className={styles.discount}>-{pct(bed)}%</span>
                )}
              </div>
              <button className={styles.button} disabled={!bed.in_stock} onClick={() => {handleAddToCart(bed); handleaddToCart(bed.id);}}>
                {addedToCart === bed?.id ? (<>
                  <TickMark /><span>Added To Cart!</span>
                  </>
                ) : (
                <>
                  <span><CartIcon />&nbsp; {bed.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                </>
              )}</button>
            </div>
          </div>
        ))}
        {toast && (
        <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
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
                {selectedProduct.tag && (
                  <span className={styles.quickViewTag}>{selectedProduct.tag}</span>
                )}
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
                  <span className={styles.quickViewPrice}>$ {selectedProduct.price}.00</span>
                  {selectedProduct.oldPrice && (
                    <span className={styles.quickViewOldPrice}>$ {selectedProduct.oldPrice}.00</span>
                  )}
                </div>

                <div className={styles.quickViewStock}>
                  <span className={selectedProduct.in_stock ? styles.stockBadgeIn : styles.stockBadgeOut}>
                    {selectedProduct.in_stock ? "● In Stock" : "○ Out of Stock"}
                  </span>
                </div>

                <div className={styles.quickViewActions}>
                  <button className={styles.quickViewCartBtn} disabled={!selectedProduct.in_stock} onClick={() => {addToCart(selectedProduct); closeQuickView(); }}>
                    <CartIcon /> &nbsp;Add to Cart</button>
                  <button className={styles.quickViewWishBtn} onClick={() => handleAddToWishList(selectedProduct)}>♡</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default Beds;
