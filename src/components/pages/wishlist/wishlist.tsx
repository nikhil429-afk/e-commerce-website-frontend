import { CartIcon, CrossIcon, EmptyWishlistIcon, LoadingSpinner, SearchIcon } from '../../../assets/Extra/svg';
import { getWishlist, removeFromWishlist } from '../../../api/wishlist';
import { useNavigate, Link } from 'react-router-dom';
import { getToken } from '../../../utils/tokenUtils';
import { addToCart } from '../../../api/cart';
import BASE_URL from '../../../utils/baseapi';
import { useState, useEffect } from 'react';
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
  const navigate = useNavigate();
  const token = getToken();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [addedCart, setAddedCart] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const loadWishlist = async () => {
    if (!token) { setLoading(false); showToast('Please sign in to view your wishlist', false); return; }
    try {
      const data = await getWishlist();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error fetching wishlist: ' + err, false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWishlist(); }, []);

  const handleRemove = async (itemId: number) => {
    try {
      await removeFromWishlist(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      showToast('Item removed from wishlist');
    } catch (err) {
      showToast('Error removing item: ' + err, false);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!token) { navigate('/login'); return; }
    try {
      await addToCart(item.product_id ?? item.id);
      setAddedCart(item.id);
      showToast('Item added to cart!');
      setTimeout(() => setAddedCart(null), 1800);
    } catch (err) {
      showToast('Error adding to cart: ' + err, false);
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
            <button className={styles.iconBtn} onClick={() => navigate('/cart')}><CartIcon /> Cart</button>
          </div>
        </nav>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><EmptyWishlistIcon /></div>
          <h2>Sign in to view your wishlist</h2>
          <p>Save your Favourite Pieces here and Revisit them anytime.</p>
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
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input className={styles.search} placeholder="Search saved items…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.navIcons}>
          <button className={styles.iconBtn} onClick={() => navigate('/products')}>Shop</button>
          <button className={styles.iconBtn} onClick={() => navigate('/cart')}><CartIcon /></button>
        </div>
      </nav>

      {loading ? (
        <div className={styles.loading}><LoadingSpinner /></div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><EmptyWishlistIcon /></div>
          <h2>Your wishlist is empty</h2>
          <p>Start saving pieces you love and Find them here Whenever you're ready.</p>
          <button className={styles.shopBtn} onClick={() => navigate('/products')}>Browse Collection</button>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <h1> My Wishlist
              <span className={styles.count}>
                {' '} –— {filtered.length} {filtered.length === 1 ? 'Piece' : 'Pieces'} Saved
              </span>
            </h1>
          </div>

          <div className={styles.grid}>
            {filtered.map((item) => (
              <div key={item.id} className={styles.card}>
                <button className={styles.removeBtn} onClick={() => handleRemove(item.id)} title="Remove from wishlist"><CrossIcon /></button>

                <div className={styles.imageWrap}>
                  {item.image
                    ? <img src={`${BASE_URL}${item.image}`} alt={item.name} loading="lazy" />
                    : <div style={{ width: '100%', height: '100%', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🪑</div>
                  }
                  {item.category && (
                    <div className={styles.cardCategory}>{item.category}</div>
                  )}
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
                    <p style={{ fontSize: '0.75rem', color: '#e05252', margin: 0, fontWeight: 600 }}>Out of Stock</p>
                  )}
                  <button className={styles.cartBtn} onClick={() => handleAddToCart(item)}
                    style={addedCart === item.id ? { background: '#28a745' } : {}} disabled={!item.in_stock || addedCart === item.id}>
                    {addedCart === item.id ? '✓ Added to Cart' : (
                      <><CartIcon />&nbsp; Move to Cart</>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && search && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
                No Item Match Found"{search}"
              </div>
            )}
          </div>
        </>
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.ok ? styles.toastSuccess : styles.toastError}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}


export default Wishlist;
