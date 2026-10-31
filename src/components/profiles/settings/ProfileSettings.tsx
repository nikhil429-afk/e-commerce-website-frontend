import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../../utils/api";
import { getProfile, updateProfile, changePassword } from "../../../api/profile";
import type { Profile } from "../../../api/profile";
import ThemeToggle from "../../../theme/ThemeToggle";
import styles from "./profilesettings.module.css";

type FieldErrors = Record<string, string>;
type Tab = "info" | "security";

interface Props {
  /** true inside the owner dashboard (no page chrome); false on the standalone /profile page. */
  embedded?: boolean;
}

// The server answers {"detail": {"email": "..."}} for field errors; turn that into {email: "..."}.
function fieldErrorsFrom(e: unknown): FieldErrors {
  if (e instanceof ApiError) {
    const d = (e.detail as { detail?: unknown } | null)?.detail;
    if (d && typeof d === "object" && !Array.isArray(d)) {
      const out: FieldErrors = {};
      for (const [k, v] of Object.entries(d as Record<string, unknown>)) if (typeof v === "string") out[k] = v;
      return out;
    }
  }
  return {};
}

const messageOf = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

function strength(pw: string) {
  const checks = [pw.length >= 8 && pw.length <= 15, /[a-z]/.test(pw), /[A-Z]/.test(pw), /\d/.test(pw)];
  const score = checks.filter(Boolean).length + (/[@$#%!]/.test(pw) ? 1 : 0);
  return { checks, score, label: ["Too weak", "Too weak", "Weak", "Okay", "Strong", "Excellent"][score] };
}

function ProfileSettings({ embedded = false }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<Tab>("info");

  const [form, setForm] = useState({ username: "", email: "", phone: "", address: "" });
  const [infoErrors, setInfoErrors] = useState<FieldErrors>({});
  const [savingInfo, setSavingInfo] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<FieldErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const flash = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const apply = useCallback((p: Profile) => {
    setProfile(p);
    setForm({ username: p.username, email: p.email, phone: p.phone, address: p.address });
  }, []);

  const load = useCallback(async () => {
    setLoadError("");
    try { apply(await getProfile()); }
    catch (e) { setLoadError(messageOf(e)); }
  }, [apply]);

  useEffect(() => { load(); }, [load]);

  const dirty = useMemo(() => !!profile && (
    form.username !== profile.username || form.email !== profile.email ||
    form.phone !== profile.phone || form.address !== profile.address), [form, profile]);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setInfoErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const submitInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !dirty || savingInfo) return;
    const local: FieldErrors = {};
    if (form.username.trim().length < 2) local.username = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) local.email = "Enter a valid email address.";
    if (form.phone.trim() && !/^\+?[0-9][0-9 ()-]{6,19}$/.test(form.phone.trim())) local.phone = "Enter a valid phone number.";
    if (Object.keys(local).length) { setInfoErrors(local); return; }

    setSavingInfo(true); setInfoErrors({});
    try {
      const res = await updateProfile({ username: form.username, email: form.email, phone: form.phone, address: form.address });
      apply(res.user);
      flash("Profile updated");
    } catch (err) {
      const fe = fieldErrorsFrom(err);
      if (Object.keys(fe).length) setInfoErrors(fe); else flash(messageOf(err), false);
    } finally { setSavingInfo(false); }
  };

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || savingPw) return;
    const local: FieldErrors = {};
    if (profile.has_password && !pw.current) local.current_password = "Enter your current password.";
    if (strength(pw.next).checks.some((c) => !c)) local.new_password = "Use 8-15 characters with an uppercase letter, a lowercase letter and a number.";
    if (pw.next !== pw.confirm) local.confirm_password = "Passwords didn't match.";
    if (Object.keys(local).length) { setPwErrors(local); return; }

    setSavingPw(true); setPwErrors({});
    try {
      const res = await changePassword({ current_password: pw.current || undefined, new_password: pw.next, confirm_password: pw.confirm });
      apply(res.user);
      setPw({ current: "", next: "", confirm: "" });
      flash("Password changed");
    } catch (err) {
      const fe = fieldErrorsFrom(err);
      if (Object.keys(fe).length) setPwErrors(fe); else flash(messageOf(err), false);
    } finally { setSavingPw(false); }
  };

  const st = strength(pw.next);
  const initials = (profile?.username ?? "").trim().slice(0, 2).toUpperCase() || "··";
  const since = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : null;

  const body = (
    <div className={styles.wrap}>
      {loadError && (
        <div className={styles.errorBox}>
          <p>{loadError}</p>
          <button className={styles.primary} onClick={load}>Try again</button>
        </div>
      )}

      {!profile && !loadError && (
        <div className={styles.skeleton}><span /><span /><span /></div>
      )}

      {profile && (
        <>
          <section className={styles.hero}>
            <div className={styles.avatar}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" className={styles.avatarImg} />
                : initials}
            </div>
            <div className={styles.heroText}>
              <h1>{profile.username}</h1>
              <p>{profile.email}</p>
              <div className={styles.badges}>
                <span className={`${styles.badge} ${profile.role === "owner" ? styles.badgeGold : ""}`}>
                  {profile.role === "owner" ? "★ Store Owner" : "Member"}
                </span>
                {profile.google_linked && <span className={styles.badge}>Google account linked</span>}
                {since && <span className={styles.badge}>Since {since}</span>}
              </div>
            </div>
          </section>

          <div className={styles.tabs} role="tablist">
            <button role="tab" aria-selected={tab === "info"} className={tab === "info" ? styles.tabOn : ""} onClick={() => setTab("info")}>Personal details</button>
            <button role="tab" aria-selected={tab === "security"} className={tab === "security" ? styles.tabOn : ""} onClick={() => setTab("security")}>Password &amp; security</button>
          </div>

          {tab === "info" && (
            <form className={styles.card} onSubmit={submitInfo} noValidate>
              <div className={styles.grid}>
                <label className={styles.field}>
                  <span>Full name</span>
                  <input value={form.username} onChange={(e) => set("username")(e.target.value)} maxLength={50} autoComplete="name" />
                  {infoErrors.username && <em>{infoErrors.username}</em>}
                </label>
                <label className={styles.field}>
                  <span>Email address</span>
                  <input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} autoComplete="email" disabled={profile.google_linked} />
                  {profile.google_linked && <small>Managed by your Google account.</small>}
                  {infoErrors.email && <em>{infoErrors.email}</em>}
                </label>
                <label className={styles.field}>
                  <span>Contact number</span>
                  <input type="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" />
                  {infoErrors.phone && <em>{infoErrors.phone}</em>}
                </label>
                <label className={`${styles.field} ${styles.wide}`}>
                  <span>Address</span>
                  <textarea rows={3} value={form.address} onChange={(e) => set("address")(e.target.value)} maxLength={255} placeholder="House / street, city, PIN code" autoComplete="street-address" />
                  {infoErrors.address && <em>{infoErrors.address}</em>}
                </label>
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.ghost} disabled={!dirty || savingInfo} onClick={() => { apply(profile); setInfoErrors({}); }}>Discard changes</button>
                <button type="submit" className={styles.primary} disabled={!dirty || savingInfo}>{savingInfo ? "Saving…" : "Save changes"}</button>
              </div>
            </form>
          )}

          {tab === "security" && (
            <form className={styles.card} onSubmit={submitPassword} noValidate>
              <p className={styles.hint}>
                {profile.has_password ? "Choose a strong password you don't use anywhere else." : "You signed up with Google. Set a password if you also want to log in with your email."}
              </p>
              <div className={styles.grid}>
                {profile.has_password && (
                  <label className={`${styles.field} ${styles.wide}`}>
                    <span>Current password</span>
                    <input type={showPw ? "text" : "password"} value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} autoComplete="current-password" />
                    {pwErrors.current_password && <em>{pwErrors.current_password}</em>}
                  </label>
                )}
                <label className={styles.field}>
                  <span>New password</span>
                  <input type={showPw ? "text" : "password"} value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} autoComplete="new-password" maxLength={15} />
                  {pwErrors.new_password && <em>{pwErrors.new_password}</em>}
                </label>
                <label className={styles.field}>
                  <span>Confirm new password</span>
                  <input type={showPw ? "text" : "password"} value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" maxLength={15} />
                  {pwErrors.confirm_password && <em>{pwErrors.confirm_password}</em>}
                </label>
              </div>

              {pw.next && (
                <div className={styles.meter}>
                  <div className={styles.bars}>{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= st.score ? styles[`lvl${Math.max(st.score, 1)}`] : ""} />)}</div>
                  <span>{st.label}</span>
                </div>
              )}
              <ul className={styles.rules}>
                <li className={st.checks[0] ? styles.ok : ""}>8-15 characters</li>
                <li className={st.checks[1] ? styles.ok : ""}>A lowercase letter</li>
                <li className={st.checks[2] ? styles.ok : ""}>An uppercase letter</li>
                <li className={st.checks[3] ? styles.ok : ""}>A number</li>
              </ul>

              <div className={styles.actions}>
                <label className={styles.check}><input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} /> Show passwords</label>
                <button type="submit" className={styles.primary} disabled={savingPw}>{savingPw ? "Updating…" : profile.has_password ? "Update password" : "Set password"}</button>
              </div>
            </form>
          )}
        </>
      )}

      {toast && <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`} role="status">{toast.msg}</div>}
    </div>
  );

  if (embedded) return <div className={styles.embedded}>{body}</div>;

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.back}>← Back to store</Link>
        <Link to="/" className={styles.logo}>Furniture<span>·</span>Co</Link>
        <ThemeToggle />
      </header>
      {body}
    </div>
  );
}

export default ProfileSettings;
