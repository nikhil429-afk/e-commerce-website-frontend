import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, increaseQuantity, decreaseQuantity, checkoutCart, checkoutItem } from '../../../api/cart';
import { getToken } from '../../../utils/tokenUtils';
import { WishlistIcon, CrossIcon, EmptyCartIcon } from '../../../assets/Extra/svg';
import BASE_URL from '../../../utils/baseapi';
import styles from './cart.module.css';
import PageNavigation from '../../pagenavigation/pagenavigation';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  image: string;
  category: string;
  price: number;
  quantity: number;
  description: string;
  in_stock: boolean;
}

function Cart() {

  const token = getToken();
  const navigate  = useNavigate();

  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const loadCart = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const data = await getCart();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);
  
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };
  
  const handleRemove = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      showToast('Item Removed from Cart');
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncrease = async (itemId: number) => {
    try {
      await increaseQuantity(itemId);
      showToast('Quantity Increased by 1');
      setItems(prev =>
      prev.map(i => {
        if (i.id === itemId) {
          if (i.quantity >= 10) { return i; }
          return { ...i, quantity: i.quantity + 1 };
        }
        return i;
      })
    );
    } catch (err) {
    console.error(err);
  }
  };

  const handleDecrease = async (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    if (item && item.quantity <= 1) { handleRemove(itemId); return; }
    try {
      await decreaseQuantity(itemId);
      showToast('Quantity Decreased by 1');
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i));
    } catch (err) {
      console.error(err);
    }
  };


  const handleCheckoutItem = async (itemId: number) => {
    if (!token) { showToast('Please Sign in to Place an Order', false);
      return;
    }
    try {
      const res = await checkoutItem(itemId);
      if (!res.ok) {
        throw new Error(res.detail || "Checkout failed");
      }
      showToast(`Item Ordered Successfully!`);
      await loadCart();
    } catch (error: any) {
      showToast(error.message, false);
    }
  };

  const handleAllCheckout = async () => {
    if (!token) { showToast('Please Sign in to Place an Order', false);
      return;
    }
    try {
      setBuying(true);
      const res = await checkoutCart();
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Checkout failed");
      }
      showToast(`Order Placed Successfully!\nOrder ID: ${data.order_id}`);
      await loadCart();
    } catch (error: any) {
      showToast(error.message, false);
    } finally {
      setBuying(false);
    }
  };

  const handleBuyAll = async () => { await handleAllCheckout(); };

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!token) {
    return (
      <div className={styles.page}>
        <nav className={styles.navbar}>
          <div className={styles.logo} onClick={() => navigate('/')}>Furniture<span>·</span>Co</div>
          <PageNavigation />
          <div className={styles.navIcons}>
            <button className={styles.iconBtn} onClick={() => navigate('/wishlist')}>♡ Wishlist</button>
          </div>
        </nav>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><EmptyCartIcon /></div>
          <h2>Sign in to view your cart</h2>
          <p>You need an account to add and manage cart items.</p>
          <button className={styles.shopBtn} onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => navigate('/')}>Furniture<span>·</span>Co</div>
        <div className={styles.navIcons}>
          <ul className={styles.navLinks}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
          <button className={styles.iconBtn} onClick={() => navigate('/wishlist')}>&nbsp;<WishlistIcon/>&nbsp;</button>
          <button className={styles.iconBtn} onClick={() => navigate('/products')}>Shop</button>
        </div>
      </nav>

      {loading ? (
        <div className={styles.loading}>Loading your cart…</div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet. Browse our collection and find something you love.</p>
          <button className={styles.shopBtn} onClick={() => navigate('/products')}>Shop Now</button>
        </div>

      ) : (
        <>
          <div className={styles.header}>
            <center><h1>My Cart
              <span className={styles.count}>({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            </h1>
            </center>

          </div>

          <div className={styles.products}>
            <div className={styles.totalprice}>
              <h2 className={styles.h2_totalprice}>Total: ${totalPrice.toLocaleString('en-IN')}</h2>
              <button className={styles.buyAllBtn} onClick={handleBuyAll} disabled={buying}>
                {buying ? 'Placing Order...' : `Buy All (${items.length} items) →`}
              </button>
            </div>
            {items.map((item) => (
              <div key={item.id} className={styles.card}>
                <button className={styles.removeBtn} onClick={() => handleRemove(item.id)} title="Remove from cart">
                  <CrossIcon />
                </button>
                <div className={styles.imageWrap}>
                  {item.image ? <img src={`${BASE_URL}${item.image}`} alt={item.name} loading="lazy" />
                    : <div style={{ width: '100%', height: '100%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🪑</div>
                  }
                  <div className={styles.imageOverlay}>
                    <button className={styles.quickViewBtn} onClick={() => navigate('/products')}>View Details</button>
                  </div>
                </div>

                <div className={styles.toggleBtn}>
                  <p>
                    <span className={styles.quantity}>Qty: {item.quantity}</span>
                    <span className={styles.qtyControls}>
                      <button className={styles.Btn} onClick={() => handleDecrease(item.id)}>−</button>
                      <span style={{ minWidth: 24, textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button className={styles.Btn} onClick={() => handleIncrease(item.id)}>+</button>
                    </span>
                  </p>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.title}>{item.name}</div>
                  <span>
                    <p className={`${styles.titleh2} ${item.in_stock ? styles.inStock : styles.outStock}`}>
                      {item.in_stock ? '● In Stock' : '○ Out of Stock'}
                    </p>
                  </span>
                  <center><div className={styles.priceRow}>
                    <span className={styles.price}>${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    {item.quantity > 1 && (
                      <span style={{ fontSize: '0.75rem', color: '#aaa', marginLeft: 6 }}>
                        ${item.price.toLocaleString('en-IN')} each
                      </span>
                    )}
                  </div></center>
                  <div className={styles.buyRow}>
                    <button className={styles.buy} onClick={() => handleCheckoutItem(item.id)} disabled={buying}>
                      {buying ? 'Placing Order...' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {toast && (
              <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
                {toast.msg}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}


export default Cart;