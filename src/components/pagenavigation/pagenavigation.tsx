import styles from "./PageNavigation.module.css";

function PageNavigation() {

  return (
    <div className={styles.navigationContainer}>
      <button className={styles.navButton}  onClick={() => {history.back()}}>← Back</button>
    </div>
  );
}


export default PageNavigation;