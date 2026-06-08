import { useState, useEffect } from 'react';
import { getWishlist, removeFromWishlist } from '../../../api/wishlist';
import { useNavigate, Link } from 'react-router-dom';
import { getToken } from '../../../utils/tokenUtils';
import { addToCart } from '../../../api/cart';
import BASE_URL from '../../../utils/baseapi';
import styles from './wishlist.module.css';

interface WishlistItem {
  id: number;
  product_id: number;
  name: string;
  image: string;
  category: string;
  price: number;
  description: string;
  in_stock: boolean;
}

function Wishlist() {
  const navigate  = useNavigate();
  const token     = getToken();

  const [items, setItems]         = useState<WishlistItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [addedCart, setAddedCart] = useState<number | null>(null);
  const [search, setSearch]       = useState('');

  const loadWishlist = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const data = await getWishlist();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWishlist(); }, []);

  const handleRemove = async (itemId: number) => {
    try {
      await removeFromWishlist(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!token) { navigate('/login'); return; }
    try {
      await addToCart(item.product_id ?? item.id);
      setAddedCart(item.id);
      setTimeout(() => setAddedCart(null), 1800);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = items.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (!token) {
    return (
      <div className={styles.page}>
        <nav className={styles.navbar}>
          <div className={styles.logo} onClick={() => navigate('/')}>Furniture<span>·</span>Co</div>
          <div className={styles.navIcons}>
            <button className={styles.iconBtn} onClick={() => navigate('/cart')}>🛒 Cart</button>
          </div>
        </nav>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.35">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <h2>Sign in to view your wishlist</h2>
          <p>Save your favourite pieces and revisit them anytime.</p>
          <button className={styles.shopBtn} onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => navigate('/')}>Furniture<span>·</span>Co</div>
        <ul className={styles.navLinks}>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input className={styles.search} placeholder="Search saved items…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className={styles.navIcons}>
          <button className={styles.iconBtn} onClick={() => navigate('/cart')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 4 }}>
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
            </svg>
            Cart
          </button>
          <button className={styles.iconBtn} onClick={() => navigate('/products')}>Shop</button>
        </div>
      </nav>

      {loading ? (
        <div className={styles.loading}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c8855a" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 11-6.22-8.56" />
          </svg>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Start saving pieces you love and find them here whenever you're ready.</p>
          <button className={styles.shopBtn} onClick={() => navigate('/products')}>Browse Collection</button>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <h1>
              My Wishlist
              <span className={styles.count}>
                {' '}— {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'} saved
              </span>
            </h1>
          </div>

          <div className={styles.grid}>
            {filtered.map((item) => (
              <div key={item.id} className={styles.card}>
                <button className={styles.removeBtn} onClick={() => handleRemove(item.id)} title="Remove from wishlist">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>

                <div className={styles.imageWrap}>
                  {item.image ? <img src={`${BASE_URL}${item.image}`} alt={item.name} loading="lazy" />
                    : <div style={{ width: '100%', height: '100%', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🪑</div>
                  }
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.title}>{item.name}</div>
                  {item.description && (
                    <div className={styles.desc}>{item.description}</div>
                  )}
                  <div className={styles.priceRow}>
                    <span className={styles.price}>${Number(item.price).toLocaleString('en-IN')}</span>
                  </div>
                  {item.in_stock === false && (
                    <p style={{ fontSize: '0.75rem', color: '#e05252', marginBottom: 8, fontWeight: 500 }}>Out of stock</p>
                  )}

                  <button className={styles.cartBtn} onClick={() => handleAddToCart(item)} disabled={item.in_stock === false}
                    style={addedCart === item.id ? { background: '#34a46a' } : {}}>
                    {addedCart === item.id ? '✓ Added to Cart' : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 5 }}>
                          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
                        </svg>Move to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && search && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>No saved items match "{search}"</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Wishlist;
