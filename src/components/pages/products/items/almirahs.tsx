import { useState, useEffect } from "react";
import { addToCart,  addToWishlist, getAlmirahs } from "../../../../api/Product_items_API/almirah";
import { StarRating } from "../../../../assets/Extra/extra_functions";
import { CartIcon, TickMark } from "../../../../assets/Extra/svg";
import { getToken } from "../../../../utils/tokenUtils";
import BASE_URL from "../../../../utils/baseapi";
import styles from "./items.module.css";
import bgAlmirah from "../../../../assets/images/Wooden-almirah.jpg";

interface Almirah { 
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


function Almirahs() {

  const token = getToken();
  
  const [, setShowTokenExpired] = useState(false);
  const [activeFilter, ] = useState("All");
  const [wished, setWished] = useState<Set<number>>(new Set());
  const [products, setProducts] = useState<Almirah[]>([]);
  const [currentIndexes, setCurrentIndexes] = useState<{ [key:number]: number }>({});
  const [selectedProduct, setSelectedProduct] = useState<Almirah | null>(null);
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
        const data = await getAlmirahs();
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

  const handleAddToWishlist = async (product: Almirah) => {
    try {
      if (!token) { showToast("Please Login First!", false);
        if (localStorage.getItem("auth_token")) { setShowTokenExpired(true); } return;
      }
      const res = await  addToWishlist(product.id);
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


  const handleAddToCart = async (product: Almirah) => {
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
      showToast("An Error Occurred while Adding to Cart", false);
    }
  };

  const handleaddToCart = (id: number) => {
    setAddedToCart(id);
    setTimeout(() => setAddedToCart(null), 3000);
  };
  
  const filtered = activeFilter === "All" ? products : products.filter( s => s.category === activeFilter || (activeFilter === "Premium" && s.price >= 250));
  const pct = (i: Almirah) => Math.round(((i.oldPrice - i.price) / i.oldPrice) * 100);
  
    if (loading) return <h2 className={styles.loading}>Loading Products....</h2>;
    if (!products.length) return <h2 className={styles.notFound}>No Product Found for Almirahs</h2>;

  return (
  <div className={styles.container}>
    <div className={styles.heroBanner}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: bgAlmirah, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.28)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(194,130,70,0.18) 0%, transparent 60%)" }} />
      <div className={styles.heroText}>
        <div className={styles.eyebrow}>✦ Almirahs Collection</div>
        <h1 className={styles.heading}>Almirahs &amp; <em>Cupboards</em></h1>
        <p className={styles.subheading}>Where Life Happens Around.</p>
      </div>
      {products.length > 0 && (
        <div className={styles.heroCountBadge}>{products.length}Pieces Available</div>
      )}
    </div>

    <div className={styles.categorySeparator} />
    
    <div className={styles.grid}>
      {(filtered || []).map(almirah => (
        <div key={almirah?.id} className={styles.card}>
          <button className={styles.wishBtn} onClick={() => handleAddToWishlist(almirah)}>{wished.has(almirah?.id) ? "♥" : "♡"}</button>
          <div className={styles.imageWrap}>
            <img src={`${BASE_URL}${almirah.images[currentIndexes[almirah.id] || 0] || almirah.images[0] }`} alt={almirah.name} loading="lazy" />
            <div className={styles.imageOverlay}>
              <button className={styles.quickViewBtn} onClick={(e) => {quickView(almirah.id, e)}}>Quick View</button>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.rating}>
              <StarRating rating={almirah.rating} />
              <span className={styles.ratingCount}>{`${almirah.rating}`}</span>
            </div>
            <h3 className={styles.title}>{almirah?.name}</h3>
            <p className={`${styles.titleh2} ${almirah.in_stock ? styles.inStock : styles.outStock}`}>
              {almirah.in_stock ? '● In Stock' : '○ Out of Stock'}
            </p>

              <div className={styles.priceRow}>
                <span className={styles.price}>$ {almirah?.price}</span>
                <span className={styles.oldPrice}>$ {almirah?.oldPrice}</span>
                {pct(almirah) > 0 && (
                  <span className={styles.discount}>-{pct(almirah)}%</span>
                )}
              </div>
              <button className={styles.button} disabled={!almirah.in_stock} onClick={() => {handleAddToCart(almirah); handleaddToCart(almirah.id);}}>
                {addedToCart === almirah.id ? (<>
                  <TickMark /><span>Added To Cart!</span>
                  </>
                ) : (
                <>
                  <span><CartIcon />&nbsp; {almirah.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                </>)}
              </button>
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
                  <button className={styles.quickViewWishBtn} onClick={() => handleAddToWishlist(selectedProduct)}>♡</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
};


export default Almirahs;