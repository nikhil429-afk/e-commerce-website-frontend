import { useState, useEffect } from "react";
import { addToCart, addToWishlist, getChairs } from "../../../../api/Product_items_API/chair";
import { StarRating } from "../../../../assets/Extra/extra_functions";
import { CartIcon, TickMark } from "../../../../assets/Extra/svg";
import { getToken } from "../../../../utils/tokenUtils";
import BASE_URL from "../../../../utils/baseapi";
import styles from "./items.module.css";

type Chair = { 
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

const BG = "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1600&q=80";


function Chairs() {
  
  const token = getToken();

  const [, setShowTokenExpired] = useState(false);

  const [activeFilter, ] = useState("All");
    const [wished, setWished] = useState<Set<number>>(new Set());
    const [products, setProducts] = useState<Chair[]>([]);
    const [currentIndexes, setCurrentIndexes] = useState<{ [key:number]: number }>({});
    const [selectedProduct, setSelectedProduct] = useState<Chair | null>(null);
    const [showQuickView, setShowQuickView] = useState(false);
    const [closingModal, setClosingModal] = useState(false);
    const [modalOrigin, setModalOrigin] = useState({x: window.innerWidth/2, y: window.innerHeight/2,});
    const [loading, setLoading] = useState<boolean>(true);
    const [, setWishlist] = useState<number[]>([]);
    const [addedToCart, setAddedToCart] = useState<number | null>(null);
  
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const data = await getChairs();
          setProducts(data);
        } catch (err) {
          console.error("Error fetching products:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }, []);

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
    if(!token){ alert("Please Login First!");
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

  const handleAddToWishlist = async (product: Chair) => {
    try {
      if (!token) { alert("Please Login First!")
        if (localStorage.getItem("auth_token")) { setShowTokenExpired(true); } return;
      }
      const res = await addToWishlist(product.id);
      if (!res.ok) { alert("Failed to Add this Item to Wishlist"); return; }
      setWishlist(prev => [...prev, product.id]);
      setWished(prev => {
        const next = new Set(prev);
        next.has(product.id) ? next.delete(product.id) : next.add(product.id);
        return next;
      });
      alert("Item Added to Wishlist Successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToCart = async (product: Chair) => {
      try {
        if (!token) { alert("Please Login First!")
        if (localStorage.getItem("auth_token")) { setShowTokenExpired(true); } return;
      }
        const res = await addToCart(product);
        const data = await res.json();
        if (!res.ok) {
          console.error(data);
          alert("Failed to add to cart");
          return;
        }
      } catch (err) {
        console.error(err);
      }
    };

    const handleaddToCart = (id: number) => {
    setAddedToCart(id);
    setTimeout(() => setAddedToCart(null), 3000);
  };
    
    const filtered = activeFilter === "All" ? products : products.filter( s => s.category === activeFilter || (activeFilter === "Premium" && s.price >= 250));
    const pct = (i: Chair) => Math.round(((i.oldPrice - i.price) / i.oldPrice) * 100);
    
    if (loading) return <h2 className={styles.loading}>Loading Products....</h2>;
    if (!products.length) return <h2 className={styles.notFound}>No Product Found!</h2>;
  
  return (
    <div className={styles.container}>
      <div className={styles.heroBanner}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${BG}')`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.28)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(194,130,70,0.18) 0%, transparent 60%)" }} />
        <div className={styles.heroText}>
          <div className={styles.eyebrow}>✦ Seating Collection</div>
          <h1 className={styles.heading}>Chairs &amp; <em>Seating</em></h1>
          <p className={styles.subheading}>Every Seat Tells a Story.</p>
        </div>
      </div>

      <div className={styles.grid}>
        {(filtered || []).map(chair => (
          <div key={chair?.id} className={styles.card}>
            <button className={styles.wishBtn} onClick={() => (chair)}>{wished.has(chair?.id) ? "♥" : "♡"}</button>
            <div className={styles.imageWrap}>
              <img src={`${BASE_URL}${chair.images[currentIndexes[chair.id] || 0] || chair.images[0] }`} alt={chair.name} loading="lazy" />
              <div className={styles.imageOverlay}>
                <button className={styles.quickViewBtn} onClick={(e) => {quickView(chair.id, e)}}>Quick View</button>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.rating}>
                <StarRating rating={chair?.rating} />
                <span className={styles.ratingCount}>{`${chair?.rating}`}</span>
              </div>
              <h3 className={styles.title}>{chair?.name}</h3>
              <p className={`${styles.titleh2} ${chair.in_stock ? styles.inStock : styles.outStock}`}>
                {chair.in_stock ? '● In Stock' : '○ Out of Stock'}
              </p>
              <div className={styles.priceRow}>
                <span className={styles.price}>$ {chair?.price}</span>
                <span className={styles.oldPrice}>$ {chair?.oldPrice}</span>
                {pct(chair) > 0 && (
                  <span className={styles.discount}>-{pct(chair)}%</span>
                )}
              </div>
              <button className={styles.button} disabled={!chair.in_stock} onClick={() => {handleAddToCart(chair); handleaddToCart(chair.id);}}>
                {addedToCart === chair.id ? (<>
                  <TickMark /><span>Added To Cart!</span>
                  </>
                ) : (
                <>
                  <span><CartIcon />&nbsp; {chair.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                </>
              )}</button>
            </div>
          </div>
        ))}
        
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
  );
}


export default Chairs;