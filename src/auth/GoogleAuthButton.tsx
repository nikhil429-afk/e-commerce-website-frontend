import { useEffect, useState } from "react";
import { GoogleLogin, useGoogleOAuth } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../api/login";
import { apiFetch } from "../utils/api";
import { saveToken } from "../utils/tokenUtils";
import { useTheme } from "../theme/ThemeContext";
import { GOOGLE_CLIENT_ID } from "./googleConfig";
import styles from "./auth.module.css";

interface Props {
  /** "signin" on the login page, "signup" on the register page (only changes the button text). */
  mode: "signin" | "signup";
}

// Google's "Authorized JavaScript origins" accept `localhost` but never a bare IP address such as 127.0.0.1.
const OPENED_ON_IP = /^\d{1,3}(\.\d{1,3}){3}$/.test(window.location.hostname);

/**
 * Watches Google's sign-in script (it must live inside <GoogleOAuthProvider>). If it has not loaded after a
 * few seconds the user is offline or an ad-blocker / firewall is blocking accounts.google.com.
 */
function ScriptWatch({ onProblem }: { onProblem: (msg: string) => void }) {
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  useEffect(() => {
    if (scriptLoadedSuccessfully) return;
    const id = window.setTimeout(() => onProblem(
      "Google's sign-in script could not load. Check your internet connection and turn off any ad-blocker or firewall that blocks accounts.google.com, then refresh."), 8000);
    return () => window.clearTimeout(id);
  }, [scriptLoadedSuccessfully, onProblem]);
  return null;
}

/**
 * "Continue with Google". The same backend endpoint logs an existing user in or creates a new one,
 * so this one component serves both the login and the sign-up page.
 */
function GoogleAuthButton({ mode }: Props) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [error, setError] = useState("");
  const [setupProblem, setSetupProblem] = useState("");
  const [busy, setBusy] = useState(false);

  // One quick check that website and server use the SAME Google Client ID (a mismatch is the #1 reason
  // for "Google login fails"), so the problem is explained on screen instead of hiding in a log.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    apiFetch<{ configured: boolean; client_id: string | null }>("/login/google/status", { auth: false })
      .then((s) => {
        if (cancelled) return;
        if (!s.configured) setSetupProblem("The server has no GOOGLE_CLIENT_ID yet. Add it to the backend .env and restart the backend.");
        else if (s.client_id !== GOOGLE_CLIENT_ID)
          setSetupProblem("The website and the server use different Google Client IDs. Make VITE_GOOGLE_CLIENT_ID (frontend .env) and GOOGLE_CLIENT_ID (backend .env) identical, then restart both.");
      })
      .catch(() => { /* backend down: the normal login error will say so */ });
    return () => { cancelled = true; };
  }, []);

  const handleCredential = async (credential?: string) => {
    if (!credential) { setError("Google did not return a sign-in token. Please try again."); return; }
    setBusy(true); setError("");
    try {
      const res = await googleLogin(credential);
      if (!res.ok || !res.data?.access_token || !res.data?.user) {
        const detail = res.data?.detail;
        setError(typeof detail === "string" ? detail : res.data?.message || "Google sign-in failed. Please try again.");
        return;
      }
      localStorage.setItem("user", JSON.stringify(res.data.user));
      saveToken(res.data.access_token);
      navigate(res.data.user.role === "owner" ? "/owner" : "/");
    } catch {
      setError("Something went wrong while signing in with Google.");
    } finally {
      setBusy(false);
    }
  };

  const shown = setupProblem || error;

  return (
    <div className={styles.socialBlock}>
      <div className={styles.divider}><span>or</span></div>
      <div className={`${styles.googleWrap} ${busy ? styles.googleBusy : ""}`}>
        {!GOOGLE_CLIENT_ID ? (
          // Same look as Google's button, so the option is always visible. It explains what is missing
          // instead of silently doing nothing until VITE_GOOGLE_CLIENT_ID is configured.
          <button
            type="button"
            className={styles.googleFallback}
            onClick={() => setError("Google sign-in is not switched on yet. Add VITE_GOOGLE_CLIENT_ID to the frontend .env file (see .env.example), then restart npm run dev.")}
          >
            <GoogleG />
            {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
          </button>
        ) : OPENED_ON_IP ? (
          <button
            type="button"
            className={styles.googleFallback}
            onClick={() => setError(`Google sign-in does not work on an IP address (${window.location.host}). Open the website at http://localhost:${window.location.port || 5173} instead.`)}
          >
            <GoogleG />
            {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
          </button>
        ) : (
          <>
            <ScriptWatch onProblem={setError} />
            <GoogleLogin
              text={mode === "signup" ? "signup_with" : "signin_with"}
              shape="pill"
              size="large"
              width="280"
              theme={isDark ? "filled_black" : "outline"}
              onSuccess={(r) => handleCredential(r.credential)}
              onError={() => setError(`Google sign-in was closed or blocked. If Google showed "origin_mismatch", add ${window.location.origin} to "Authorized JavaScript origins" for your OAuth client in Google Cloud Console.`)}
            />
          </>
        )}
      </div>
      {shown && <p className={styles.errorMessage} role="alert">{shown}</p>}
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default GoogleAuthButton;
