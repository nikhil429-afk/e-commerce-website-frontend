import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./auth.module.css";
import { useLogin } from "../api/auth";
import { EyeIcon, EyeOffIcon} from "../assets/Extra/svg";

function Login() {

  const navigate = useNavigate();
  
  const [showPwd, setShowPwd] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const { form, error, message, loading, handleChange, handleSubmit } = useLogin();

  const showToastMsg = (msg: string) => {
    setToast({ msg, ok: true });
    setTimeout(() => setToast(null), 4000);
  };

  const handleNavigation = () => {
    setExiting(true);
    setTimeout(() => navigate("/register"), 550);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={`${styles.container} ${exiting ? styles.exiting : ""}`}>
          <div className={styles.heading}>
            <div className={styles.badge}>Welcome Back</div>
            <h2 className={styles.cardTitle} data-text="Log In">Log In</h2>
            <p className={styles.subText}>Good To See You Again — Sign in To Continue</p>
            <div className={styles.accentLine}></div>
          </div>

          <div className={`${styles.field} ${error.email ? styles.error : ""}`}>
            <label className={styles.label}>Email Address : </label>
            <input name="email" value={form.email} className={styles.input} onChange={handleChange} placeholder="john@example.com" />
            {error.email && (
              <div className={styles.errMsg}>
                <span className={styles.errDot}></span>
                {error.email}
              </div>
            )}
          </div>

          <div className={`${styles.field} ${styles.hasIcon} ${error.pwd ? styles.error : ""}`}>
            <label className={styles.label}>Password : </label>
            <input type={showPwd ? "text" : "password"} name="pwd" value={form.pwd} className={styles.input} onChange={handleChange}
              placeholder="Enter Your Password" />
            <span className={styles.fieldIcon} onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <EyeIcon /> : <EyeOffIcon />}
            </span>
            {error.pwd && (
              <div className={styles.errMsg}>
                <span className={styles.errDot}></span>
                {error.pwd}
              </div>
            )}
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Log In →"}
          </button>
          {toast && (
            <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
              {toast.msg}
            </div>
          )}
          {message && <p className={styles.successMessage}>{message}</p>}
          {error.general && <p className={styles.errorMessage}>{error.general}</p>}

          <div className={styles.footer}>
            <span className={styles.footerTxt}>Don't Have An Account?</span>
            <button type="button" onClick={handleNavigation} className={styles.link}>
              Sign Up <span className={styles.linkArrow}>→</span>
            </button>
          </div>
        </form>
        <div className={styles.imagePanel} />
      </div>
    </div>
  );
}


export default Login;
