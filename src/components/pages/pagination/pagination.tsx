import styles from "./pagination.module.css"

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handleClick = (page: number) => {
    if (page > 0 && page <= totalPages) onPageChange(page);
  };

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    const delta = 1;
    const left = currentPage - delta;
    const right = currentPage + delta;
    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button className={styles.pageNavBtn} onClick={() => handleClick(currentPage - 1)} disabled={currentPage === 1}>Prev.</button>
      {getPages().map((page, idx) =>
        page === "..." ? (
          <span key={`sep-${idx}`} className={styles.pageSep}>···</span>
        ) : (
          <button key={page} disabled={currentPage === page} onClick={() => handleClick(page as number)}
            className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}> {page}
          </button>
        )
      )}
      <button className={styles.pageNavBtn} onClick={() => handleClick(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};