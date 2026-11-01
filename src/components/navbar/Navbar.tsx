import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CartIcon, SearchIcon, WishlistIcon } from '../../assets/Extra/svg';
import { getFetchCart, getFetchWishlist } from '../../api/dashboard';
import { clearToken, getToken, getTokenPayload } from '../../utils/tokenUtils';
import ThemeToggle from '../../theme/ThemeToggle';
import styles from './navbar.module.css';

interface NavbarProps {
  /** Pass a live count to keep the badge in sync with the page; if omitted the navbar fetches it itself. */
  cartCount?: number;
  wishlistCount?: number;
  /** Optional page-level search box (shown in the desktop bar and inside the mobile menu). */
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
}

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products', end: false },
  { to: '/about', label: 'About', end: true },
  { to: '/contact', label: 'Contact', end: true },
];

function Navbar({ cartCount, wishlistCount, search }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const user = getTokenPayload();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [ownCart, setOwnCart] = useState(0);
  const [ownWish, setOwnWish] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  // counts: use the page's live value when given, otherwise fetch once
  useEffect(() => {
    if (!token || (cartCount !== undefined && wishlistCount !== undefined)) return;
    let alive = true;
    if (cartCount === undefined) {
      getFetchCart(token).then(d => { if (alive && Array.isArray(d)) setOwnCart(d.length); }).catch(() => {});
    }
    if (wishlistCount === undefined) {
      getFetchWishlist(token).then(d => { if (alive && Array.isArray(d)) setOwnWish(d.length); }).catch(() => {});
    }
    return () => { alive = false; };
  }, [token, cartCount, wishlistCount, location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menus whenever the route changes
  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location.pathname]);

  // close the profile dropdown on outside click / Escape; close the mobile menu on Escape
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setProfileOpen(false); setMenuOpen(false); setLogoutOpen(false); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // lock page scroll while the mobile menu or the sign-out dialog is open
  useEffect(() => {
    const lock = menuOpen || logoutOpen;
    const prev = document.body.style.overflow;
    if (lock) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen, logoutOpen]);

  const cart = cartCount ?? ownCart;
  const wish = wishlistCount ?? ownWish;
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '';

  const confirmLogout = () => {
    clearToken();
    setLogoutOpen(false);
    setMenuOpen(false);
    navigate('/login');
  };

  const SearchBox = ({ mobile = false }: { mobile?: boolean }) =>
    search ? (
      <label className={`${styles.search} ${mobile ? styles.searchMobile : ''}`}>
        <span className={styles.searchIcon}><SearchIcon /></span>
        <input
          type="search"
          value={search.value}
          placeholder={search.placeholder ?? 'Search…'}
          onChange={e => search.onChange(e.target.value)}
          aria-label={search.placeholder ?? 'Search'}
        />
      </label>
    ) : null;

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.bar}>
          <Link to="/" className={styles.logo} aria-label="Furniture Co home">
            Furniture<span>·</span>Co
          </Link>

          <nav className={styles.links} aria-label="Primary">
            {LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            {search && <div className={styles.desktopSearch}><SearchBox /></div>}

            <ThemeToggle variant="icon" />

            <button className={styles.iconBtn} onClick={() => navigate('/wishlist')} aria-label="Wishlist" title="Wishlist">
              <WishlistIcon />
              {wish > 0 && <span className={styles.badge}>{wish > 99 ? '99+' : wish}</span>}
            </button>

            <button className={styles.iconBtn} onClick={() => navigate('/cart')} aria-label="Cart" title="Cart">
              <CartIcon />
              {cart > 0 && <span className={styles.badge}>{cart > 99 ? '99+' : cart}</span>}
            </button>

            {user ? (
              <div className={styles.profile} ref={profileRef}>
                <button
                  className={styles.avatar}
                  onClick={() => setProfileOpen(o => !o)}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-label="Account menu"
                  title={user.username}
                >
                  {initials}
                </button>
                {profileOpen && (
                  <div className={styles.dropdown} role="menu">
                    <div className={styles.dropdownHead}>
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                    </div>
                    {user.role === 'owner' && (
                      <button role="menuitem" onClick={() => navigate('/owner')}>Owner Panel</button>
                    )}
                    <button role="menuitem" onClick={() => navigate('/profile')}>Profile Settings</button>
                    <button role="menuitem" className={styles.danger} onClick={() => { setProfileOpen(false); setLogoutOpen(true); }}>Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authBtns}>
                <button className={styles.ghostBtn} onClick={() => navigate('/login')}>Sign in</button>
                <button className={styles.solidBtn} onClick={() => navigate('/register')}>Join</button>
              </div>
            )}

            <button
              className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* mobile / tablet menu */}
      <div
        className={`${styles.scrim} ${menuOpen ? styles.scrimOpen : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <aside id="mobile-menu" className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`} aria-hidden={!menuOpen}>
        <SearchBox mobile />
        <nav className={styles.drawerLinks} aria-label="Mobile">
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              tabIndex={menuOpen ? 0 : -1}
              className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.drawerFoot}>
          {user ? (
            <>
              <div className={styles.drawerUser}>
                <span className={styles.avatarSm}>{initials}</span>
                <div><strong>{user.username}</strong><span>{user.email}</span></div>
              </div>
              <div className={styles.drawerRow}>
                {user.role === 'owner' && (
                  <button className={styles.ghostBtn} tabIndex={menuOpen ? 0 : -1} onClick={() => navigate('/owner')}>Owner Panel</button>
                )}
                <button className={styles.ghostBtn} tabIndex={menuOpen ? 0 : -1} onClick={() => navigate('/profile')}>Profile</button>
                <button className={styles.solidBtn} tabIndex={menuOpen ? 0 : -1} onClick={() => setLogoutOpen(true)}>Sign out</button>
              </div>
            </>
          ) : (
            <div className={styles.drawerRow}>
              <button className={styles.ghostBtn} tabIndex={menuOpen ? 0 : -1} onClick={() => navigate('/login')}>Sign in</button>
              <button className={styles.solidBtn} tabIndex={menuOpen ? 0 : -1} onClick={() => navigate('/register')}>Join</button>
            </div>
          )}
        </div>
      </aside>

      {logoutOpen && (
        <div className={styles.modalOverlay} onClick={() => setLogoutOpen(false)}>
          <div className={styles.modalBox} role="dialog" aria-modal="true" aria-label="Sign out" onClick={e => e.stopPropagation()}>
            <h3>Sign out?</h3>
            <p>{user?.username ? `You're signed in as ${user.username}.` : 'You will need to sign in again to continue.'}</p>
            <div className={styles.modalActions}>
              <button className={styles.ghostBtn} onClick={() => setLogoutOpen(false)}>Cancel</button>
              <button className={styles.solidBtn} onClick={confirmLogout}>Sign out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
