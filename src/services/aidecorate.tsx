import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { apiFetch, ApiError } from "../utils/api";
import { getToken } from "../utils/tokenUtils";
import BASE_URL from "../utils/baseapi";
import ThemeToggle from "../theme/ThemeToggle";
import styles from "./decorate.module.css";

interface RecommendedProduct {
  rank: number;
  tags: string[];
  product_id: number;
  name: string;
  image: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  tag: string;
  confidence: number;
  reason: string;
}

interface EmptySpace {
  space_description: string;
  box_2d: [number, number, number, number];
  position: string;
  size: string;
  note: string;
  recommended_products: RecommendedProduct[];
}

interface RoomInfo {
  type_label: string;
  style: string;
  palette: string[];
  summary: string;
  already_has: string[];
}

interface DecorateResponse {
  room: RoomInfo | null;
  empty_spaces: EmptySpace[];
  message?: string;
}

const MAX_MB = 8;
const STEPS = ["Studying your room…", "Spotting free spaces…", "Checking what fits, size by size…", "Ranking the best pieces…"];

const imgUrl = (p: string) => (!p ? "" : p.startsWith("http") ? p : `${BASE_URL}${p}`);
const money = (n: number) => `$${Number(n || 0).toLocaleString()}`;

function Stars({ value }: { value: number }) {
  return (
    <span className={styles.stars} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= value ? styles.starOn : styles.starOff}>★</span>)}
    </span>
  );
}

function Decorate() {
  const loggedIn = !!getToken();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [spaces, setSpaces] = useState<EmptySpace[] | null>(null);
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [pick, setPick] = useState(0);
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  // free the browser memory used by the preview image
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // friendly rotating status text while the AI works
  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2200);
    return () => window.clearInterval(id);
  }, [loading]);

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { showToast("Please choose a JPG, PNG or WEBP photo.", false); return; }
    if (f.size > MAX_MB * 1024 * 1024) { showToast(`That photo is larger than ${MAX_MB} MB.`, false); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSpaces(null); setRoom(null); setNotice(""); setActive(0); setPick(0);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files?.[0]); };
  const onInput = (e: ChangeEvent<HTMLInputElement>) => { pickFile(e.target.files?.[0]); e.target.value = ""; };

  const reset = () => { setFile(null); setPreview(null); setSpaces(null); setRoom(null); setNotice(""); setActive(0); setPick(0); };

  const analyse = async () => {
    if (!file || loading) return;
    setLoading(true); setSpaces(null); setRoom(null); setNotice("");
    try {
      const form = new FormData();
      form.append("file", file);
      const data = await apiFetch<DecorateResponse>("/ai-decorate", { method: "POST", form });
      const list = Array.isArray(data?.empty_spaces) ? data.empty_spaces : [];
      setSpaces(list); setRoom(data?.room ?? null); setActive(0); setPick(0);
      if (list.length === 0) setNotice(data?.message || "We couldn't find a free spot in this photo. Try a wider shot of the room.");
      else showToast(`Found ${list.length} spot${list.length > 1 ? "s" : ""} for new furniture ✨`);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
      setNotice(msg); setSpaces([]); setRoom(null);
      showToast(msg, false);
    } finally {
      setLoading(false);
    }
  };

  const current = spaces?.[active];
  const list = current?.recommended_products ?? [];
  const featured = list[Math.min(pick, Math.max(list.length - 1, 0))];

  const goSpace = (i: number) => { setActive(i); setPick(0); };
  const nextPick = () => {
    if (pick < list.length - 1) setPick(pick + 1);
    else if (spaces && active < spaces.length - 1) goSpace(active + 1);
  };
  const prevPick = () => { if (pick > 0) setPick(pick - 1); };

  // arrow keys step through the picks one by one
  useEffect(() => {
    if (!spaces || spaces.length === 0 || loading) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") nextPick();
      if (e.key === "ArrowLeft") prevPick();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const addCart = async (p: RecommendedProduct) => {
    setBusyId(`c${p.product_id}`);
    try { await apiFetch(`/cart/${p.product_id}`, { method: "PUT" }); showToast(`${p.name} added to cart`); }
    catch (e) { showToast(e instanceof ApiError ? e.message : "Could not add to cart", false); }
    finally { setBusyId(null); }
  };

  const addWish = async (p: RecommendedProduct) => {
    setBusyId(`w${p.product_id}`);
    try { await apiFetch(`/wishlist/${p.product_id}`, { method: "POST" }); showToast(`${p.name} saved to wishlist`); }
    catch (e) { showToast(e instanceof ApiError ? e.message : "Could not save to wishlist", false); }
    finally { setBusyId(null); }
  };

  const pins = useMemo(() => (spaces ?? []).map((s) => {
    const [y1, x1, y2, x2] = s.box_2d;
    const has = y2 > y1 && x2 > x1;
    return { left: has ? (x1 + x2) / 20 : 50, top: has ? (y1 + y2) / 20 : 50, box: has ? { left: x1 / 10, top: y1 / 10, width: (x2 - x1) / 10, height: (y2 - y1) / 10 } : null };
  }), [spaces]);

  return (
    <div className={styles.page}>
      <div className={styles.glow1} /><div className={styles.glow2} />

      <header className={styles.topbar}>
        <Link to="/" className={styles.back}>← Home</Link>
        <Link to="/" className={styles.logo}>Furniture<span>·</span>Co</Link>
        <ThemeToggle />
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.badge}>✦ AI Room Stylist</span>
          <h1>Let AI find the perfect spot<br />for your next piece</h1>
          <p>Upload a photo of your room. We spot the empty corners and pick furniture from our store that actually fits.</p>
        </section>

        {!loggedIn ? (
          <div className={styles.gate}>
            <h2>Sign in to try the AI stylist</h2>
            <p>It only takes a moment, and you can use Google.</p>
            <Link to="/login" className={styles.primary}>Sign in</Link>
          </div>
        ) : (
          <section className={styles.workspace}>
            {!preview ? (
              <div
                className={`${styles.drop} ${dragOver ? styles.dropOver : ""}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
              >
                <div className={styles.dropIcon}>🛋️</div>
                <h3>Drag &amp; drop your room photo</h3>
                <p>or click to browse · JPG, PNG, WEBP · up to {MAX_MB} MB</p>
              </div>
            ) : (
              <div className={styles.stage}>
                <div className={styles.photoWrap}>
                  <img src={preview} alt="Your room" className={styles.photo} />
                  {loading && <div className={styles.scan} />}
                  {!loading && spaces && spaces.map((_, i) => (
                    <button
                      key={i} type="button"
                      className={`${styles.pin} ${i === active ? styles.pinActive : ""}`}
                      style={{ left: `${pins[i].left}%`, top: `${pins[i].top}%` }}
                      onClick={() => goSpace(i)}
                      aria-label={`Show recommendations for spot ${i + 1}`}
                    >{i + 1}</button>
                  ))}
                  {!loading && current && pins[active]?.box && (
                    <div className={styles.zone} style={{ left: `${pins[active].box!.left}%`, top: `${pins[active].box!.top}%`, width: `${pins[active].box!.width}%`, height: `${pins[active].box!.height}%` }} />
                  )}
                </div>

                <div className={styles.actions}>
                  <button className={styles.ghost} onClick={reset} disabled={loading}>Change photo</button>
                  <button className={styles.primary} onClick={analyse} disabled={loading}>
                    {loading ? STEPS[step] : spaces ? "Analyse again" : "✨ Decorate my room"}
                  </button>
                </div>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onInput} />
          </section>
        )}

        {loading && (
          <div className={styles.skeletonRow}>
            {[0, 1, 2].map((i) => <div key={i} className={styles.skeleton} style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        )}

        {!loading && spaces && spaces.length === 0 && (
          <div className={styles.empty}><span>🪑</span><p>{notice}</p></div>
        )}

        {!loading && spaces && spaces.length > 0 && current && featured && (
          <section className={styles.results}>
            {room && (
              <div className={styles.insight}>
                <div className={styles.insightHead}>
                  <span className={styles.insightLabel}>Your room</span>
                  <h3>{room.type_label} · <em>{room.style === "other" ? "Mixed style" : `${room.style[0].toUpperCase()}${room.style.slice(1)} style`}</em></h3>
                </div>
                {room.summary && <p>{room.summary}</p>}
                <div className={styles.chips}>
                  {room.palette.map((c) => <span key={c} className={styles.chip}>{c}</span>)}
                  {room.already_has.length > 0 && <span className={`${styles.chip} ${styles.chipSoft}`}>Already has: {room.already_has.join(", ")}</span>}
                </div>
              </div>
            )}

            <div className={styles.tabs} role="tablist">
              {spaces.map((s, i) => (
                <button key={i} role="tab" aria-selected={i === active} className={`${styles.tab} ${i === active ? styles.tabActive : ""}`} onClick={() => goSpace(i)}>
                  <b>{i + 1}</b>{s.space_description}
                </button>
              ))}
            </div>

            <div className={styles.spaceInfo}>
              <h2>Picked for “{current.space_description}”</h2>
              <div className={styles.chips}>
                {current.position !== "other" && <span className={styles.chip}>{current.position}</span>}
                <span className={styles.chip}>{current.size} free area</span>
              </div>
              {current.note && <p className={styles.tip}><span>Stylist tip</span>{current.note}</p>}
            </div>

            <div className={styles.showcase} key={`${active}-${featured.product_id}`}>
              <article className={styles.spotlight}>
                <div className={styles.spotImg}>
                  <img src={imgUrl(featured.image)} alt={featured.name} />
                  <span className={styles.rank}>{featured.rank === 1 ? "★ Top pick" : `Pick #${featured.rank}`}</span>
                  <div className={styles.ring} style={{ ["--pct" as string]: `${featured.confidence}%` }} title={`${featured.confidence}% match`}>
                    <span>{featured.confidence}<small>%</small></span>
                  </div>
                </div>
                <div className={styles.spotBody}>
                  <span className={styles.cat}>{featured.category}</span>
                  <h3>{featured.name}</h3>
                  <Stars value={featured.rating} />
                  <p className={styles.reason}>{featured.reason}</p>
                  {featured.tags.length > 0 && <div className={styles.chips}>{featured.tags.map((tg) => <span key={tg} className={styles.chipGold}>{tg}</span>)}</div>}
                  <div className={styles.price}>
                    <strong>{money(featured.price)}</strong>
                    {featured.oldPrice > featured.price && <s>{money(featured.oldPrice)}</s>}
                  </div>
                  <div className={styles.cardBtns}>
                    <button className={styles.primary} onClick={() => addCart(featured)} disabled={busyId === `c${featured.product_id}`}>
                      {busyId === `c${featured.product_id}` ? "Adding…" : "Add to cart"}
                    </button>
                    <button className={styles.heart} onClick={() => addWish(featured)} disabled={busyId === `w${featured.product_id}`} aria-label="Save to wishlist" title="Save to wishlist">♡</button>
                  </div>
                </div>
              </article>

              <aside className={styles.queue}>
                <div className={styles.queueHead}>
                  <span>Ranked for this spot</span>
                  <b>{Math.min(pick, list.length - 1) + 1} / {list.length}</b>
                </div>
                <ol>
                  {list.map((p, i) => (
                    <li key={p.product_id} style={{ animationDelay: `${i * 0.12}s` }}>
                      <button className={`${styles.queueItem} ${i === pick ? styles.queueOn : ""}`} onClick={() => setPick(i)}>
                        <i>{p.rank}</i>
                        <img src={imgUrl(p.image)} alt="" loading="lazy" />
                        <span className={styles.qText}>
                          <strong>{p.name}</strong>
                          <small>{money(p.price)} · {p.category}</small>
                          <span className={styles.bar}><span style={{ width: `${p.confidence}%` }} /></span>
                        </span>
                        <em>{p.confidence}%</em>
                      </button>
                    </li>
                  ))}
                </ol>
                <div className={styles.stepper}>
                  <button className={styles.ghost} onClick={prevPick} disabled={pick === 0}>← Previous</button>
                  <button className={styles.primary} onClick={nextPick} disabled={pick >= list.length - 1 && active >= spaces.length - 1}>
                    {pick < list.length - 1 ? "Next pick →" : active < spaces.length - 1 ? "Next space →" : "All done"}
                  </button>
                </div>
              </aside>
            </div>
          </section>
        )}
      </main>

      {toast && <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`} role="status">{toast.msg}</div>}
    </div>
  );
}

export default Decorate;
