import { Link, useNavigate } from 'react-router-dom';
import styles from './notfound.module.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.errorPage}>
      <div className={styles.errorGlow} />
      <div className={styles.errorGlow2} />

      <div className={styles.errorContent}>
        <span className={styles.errorCode}>404</span>
        <h1>This room doesn't exist yet.</h1>
        <p>
          The page you're looking for has been moved, renamed, or never
          existed. Let's get you back to browsing furniture instead of broken links.
        </p>
        <div className={styles.errorActions}>
          <Link to="/" className={styles.primaryBtn}>Back to Home</Link>
          <button className={styles.ghostBtn} onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
