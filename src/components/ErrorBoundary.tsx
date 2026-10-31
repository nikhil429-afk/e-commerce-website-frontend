import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styles from './pages/notfound/notfound.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

/**
 * Catches JavaScript errors thrown anywhere in the component tree beneath it
 * during rendering, and shows a friendly "something went wrong" screen instead
 * of a blank white page / browser crash dump.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep this even in production so issues are visible in the browser console.
    console.error('Unhandled error caught by ErrorBoundary:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorPage}>
          <div className={styles.errorGlow} />
          <div className={styles.errorContent}>
            <span className={styles.errorCode}>Oops</span>
            <h1>Something went wrong</h1>
            <p>
              An unexpected error interrupted this page. It isn't you — our workshop
              hit a snag. Try refreshing, or head back home.
            </p>
            <div className={styles.errorActions}>
              <button className={styles.primaryBtn} onClick={this.handleReload}>
                Back to Home
              </button>
              <button className={styles.ghostBtn} onClick={() => window.location.reload()}>
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
