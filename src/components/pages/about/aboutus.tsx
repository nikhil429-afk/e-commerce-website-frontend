import React from "react";
import styles from "./aboutus.module.css";
import { Link, useNavigate } from "react-router-dom";
import { RightArrowIcon } from "../../../assets/Extra/svg"
import PageNavigation from "../../pagenavigation/pagenavigation";

function Aboutus() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const stats = [
    { num: "15", suffix: "+", label: "Years of Craft" },
    { num: "200", suffix: "+", label: "Unique Designs" },
    { num: "25k", suffix: "+", label: "Happy Homes" },
    { num: "10", suffix: " yr", label: "Warranty" },
  ];


  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo}>Furniture<span>&nbsp;·&nbsp;</span>Co.</Link>
        <PageNavigation />
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/products" className={styles.navLink}>Products</Link>
          <Link to="/about" onClick={() => { scrollToTop(); }} className={`${styles.navLink} ${styles.navLinkActive}`}>About</Link>
          <Link to="/contact" className={styles.navLink}>Contact</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroDecorLine} />
        <div className={styles.heroOrnamentsWrap}>
          <div className={styles.heroRing1} />
          <div className={styles.heroRing2} />
          <div className={styles.heroRingLeft} />
        </div>

        <div className={styles.heroPill}>✦ Est. 2015 · Palampur, Himachal Pradesh, India</div>
        <h1 className={styles.heroTitle}>
          Crafting Spaces,
          <br />
          <em>Curating Lives.</em>
        </h1>
        <p className={styles.heroSubtitle}>
          We are more than a furniture brand. We're a family of craftsmen, designers, and dreamers — passionate about turning every house into a home.
        </p>
        <div className={styles.heroBreadcrumb}>
          <span onClick={() => navigate("/")}>Home</span>
          <span style={{ color: "#D6C4A8" }}>›</span>
          <span>About Us</span>
        </div>
      </section>

      <div className={styles.statsBand}>
        {stats.map((s, i) => (
          <React.Fragment key={i}>
            <div className={styles.statItem}>
              <div className={styles.statNum}>
                {s.num}<span>{s.suffix}</span>
              </div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
            {i < stats.length - 1 && <div className={styles.statDivider} />}
          </React.Fragment>
        ))}
      </div>

      <section className={styles.storySection}>
        <div className={styles.storyImageCol}>
          <div className={styles.storyDecorDot} />
          <div className={styles.storyImageFrame}>
            <div className={styles.storyImagePlaceholder}>🛋️</div>
          </div>
          <div className={styles.storyImageBadge}>
            <div className={styles.storyImageBadgeNum}>15</div>
            <div className={styles.storyImageBadgeText}>Years<br />of Craft</div>
          </div>
        </div>

        <div className={styles.storyTextCol}>
          <p className={styles.sectionEyebrow}>Our Story</p>
          <h2 className={styles.sectionTitle}>From a Workshop<br />to <em>Your Home</em></h2>
          <div className={styles.sectionLine} />
          <p className={styles.storyText}>
            Furniture·Co was founded in 2015 by Dhiman Furniture, a First-generation woodworker who wanted to bridge the gap between heirloom craftsmanship and modern living. What began as a small workshop in Palampur's industrial quarter has grown into one of India's most trusted home furnishing Brands.
          </p>
          <p className={styles.storyText}>
            Every piece we make begins with a conversation — about how you live, what you love, and the moments you want to create. We believe furniture is never just furniture. It's where families gather, where ideas are born, and where memories are made.
          </p>
          <div className={styles.storyQuote}>
            <p className={styles.storyQuoteText}>
              "A beautiful chair doesn't just fill a corner. It holds conversations, cradles rest, and witnesses a lifetime."
            </p>
            <p className={styles.storyQuoteAuthor}>— Dhiman Furniture, Founder</p>
          </div>
        </div>
      </section>

      <section className={styles.valuesSection}>
        <div className={styles.valuesSectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>What Drives Us</p>
            <h2 className={styles.sectionTitle}>Our <em>Values</em></h2>
            <div className={styles.sectionHeadLine} />
          </div>
        </div>
      </section>

      <section className={styles.teamSection}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>The People Behind It</p>
          <h2 className={styles.sectionTitle}>Meet the <em>Team</em></h2>
          <div className={styles.sectionHeadLine} />
        </div>
      </section>

      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerBlob} />
        <div className={styles.ctaBannerBlob2} />
        <p className={styles.ctaPill}>✦ Ready to Transform Your Space?</p>
        <h2 className={styles.ctaTitle}>Let's Build Something <em>Beautiful</em></h2>
        <p className={styles.ctaText}>
          Browse our collection of handcrafted furniture or speak with one of our design consultants. Every home deserves a story worth telling.
        </p>
        <div className={styles.ctaBtns}>
          <button className={styles.ctaBtnPrimary} onClick={() => navigate("/products")}>
            Shop the Collection <RightArrowIcon />
          </button>
          <button className={styles.ctaBtnGhost} onClick={() => navigate("/contact")}>Get in Touch</button>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerLogo}>
          Furniture<span>·</span>Co.
        </Link>
        <p className={styles.footerCopy}>© 2025 Furniture·Co. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Aboutus;
