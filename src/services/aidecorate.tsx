import React, { useState, useRef } from 'react';
import { UploadImage } from '../api/aidecorate';
import { Upload } from '../assets/Extra/svg';
import styles from "./decorate.module.css"

interface RecommendedProduct {
  product_id: number;
  name: string;
  image: string;
  category: string;
  price: number;
  rating: number;
  confidence: number;
  reason: string;
}

interface EmptySpace {
  space_description: string;
  box_2d: [number, number, number, number];
  recommended_products: RecommendedProduct[];
}

function Decorate() {

  const [search, setSearch] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [products,setProducts]=useState<EmptySpace[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false);
  const [, setUploadProgress] = useState(0);
  const [modalFading, setModalFading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const openUploadModal = () => { setUploadFile(null); setUploadProgress(0); setUploadStatus("idle"); setShowUploadModal(true); };
  const closeUploadModal = () => { setShowUploadModal(false); setUploadFile(null); setUploadProgress(0); setUploadStatus("idle"); };


  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadStatus("idle");
      setImageSrc(URL.createObjectURL(file));
    }
    showToast("File Fetched Successfully!", true)
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setUploadStatus("uploading"); setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 90) { clearInterval(interval); return p; }
        return p + Math.floor(Math.random() * 12) + 4; });
    }, 160);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await UploadImage(formData);
      clearInterval(interval);
      showToast("Loading Your AI Decoration", true);
      if (!res.ok) throw new Error();
      const data = await res.json();
      // console.log("Google Response:", data);
      console.log(data.empty_spaces[0].recommended_products[0]);
      setProducts(data.empty_spaces);
      setUploadProgress(100); setUploadStatus("done");
    } catch {
      showToast("Failed to Load AI Decoration", false);
      clearInterval(interval); setUploadStatus("error");
    }
  };

  const smoothCloseUploadModal = () => {
    setModalFading(true);
    setTimeout(() => { setModalFading(false); closeUploadModal(); }, 300);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  }

  const filterProducts = (list: RecommendedProduct[]) => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list?.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  };

  const hasRecommendations = products?.length > 0;

  return(
  <div className={styles.Container}>
    {loading ? <p className={styles.loading}>Loading Image...</p> : (
      <div className={imageSrc ? styles.uploadContainerActive : styles.uploadContainer}>
        <div className={imageSrc ? styles.uploadImageCompact : styles.uploadImage}>
        {imageSrc ? (
          <button onClick={openUploadModal} className={styles.uploadAnotherBtn}>
            <Upload />Upload Another Image
          </button>
        ) : (
        <div className={styles.card}>
          <div className={styles.cardTitle}> Room Decoration With Our AI </div>
            <div className={styles.cardSub}> Upload Room Images and Get your Room AI Ready </div>
            <button onClick={openUploadModal} className={styles.uploadBtn}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(99,102,241,0.48)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(99,102,241,0.35)"; }}>
              <Upload />Upload Room Image
            </button>
          </div>
        )}
          {showUploadModal && (
            <div onClick={e => e.target === e.currentTarget && smoothCloseUploadModal()} className={styles.uploadModalOverlay}
            style={{ opacity: modalFading ? 0 : 1 }}>
            <div className={styles.uploadModalBox}
              style={{ transform: modalFading ? "scale(0.96) translateY(8px)" : "scale(1) translateY(0)" }}>
              <div className={styles.uploadModalHeader}>
                <div>
                  <h3 className={styles.uploadModalTitle}> Upload File </h3>
                  <p className={styles.uploadModalSub}> Drag & Drop or Browse To Upload </p>
                </div>
                <button onClick={smoothCloseUploadModal} className={styles.modalCloseBtn}> ✕ </button>
              </div>
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()} className={styles.dropZone}
                style={{
                  borderColor: dragOver ? "#6366f1" : uploadFile ? "#10b981" : "rgba(255,255,255,0.12)",
                  background: dragOver ? "rgba(99,102,241,0.06)" : uploadFile ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                }}>
                <input ref={fileInputRef} type="file" name="file_upload" style={{ display: "none" }} onChange={handleFileInput} />
                {uploadFile ? (
                <div>
                  <div className={styles.fileEmoji}>📄</div> <div className={styles.fileName}>{uploadFile.name}</div>
                  {/* <div className={styles.fileSize}> {formatBytes(uploadFile.size)} </div> */}
                  <div className={styles.fileReady}>✓ Loaded — Click To Replace</div>
                </div>
                ) : (
                <div>
                  <div className={styles.dropIconWrap}><Upload /></div>
                  <div className={styles.dropTitle}>Drop Your File Here</div>
                  <div className={styles.dropSub}>or <span className={styles.dropBrowse}>Browse Files</span></div>
                </div>
              )}
            </div>
            {uploadStatus === "uploading" && (
              <div className={styles.progressWrap}>
              </div>
            )}
            {uploadStatus === "done" && <div className={styles.uploadSuccess}>✓ File Uploaded Successfully!</div>}
            {uploadStatus === "error" && <div className={styles.uploadError}>✕ Upload Failed! Please Try Again ↻</div>}
            <div className={styles.uploadModalFooter}>
              {uploadStatus === "done" ? (
                <button onClick={() => {smoothCloseUploadModal()}} className={styles.doneBtnGreen}>Decorate Now</button>
              ) : (
                <button onClick={handleUploadSubmit} disabled={!uploadFile || uploadStatus === "uploading"}
                  className={(!uploadFile || uploadStatus === "uploading") ? styles.uploadSubmitDisabled : styles.uploadSubmit}>
                  {uploadStatus === "uploading" ? "Uploading..." : "Upload File"}
                </button>
              )}
              <button onClick={() => {smoothCloseUploadModal()}} className={styles.uploadCancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
          </div>
          {imageSrc && (
          <div className={styles.decorateImage}>
              {hasRecommendations && (
                <input className={styles.search} type="text" placeholder="Search Products..." value={search}
                  onChange={e => handleSearch(e.target.value)} />
              )}
              <div className={styles.imageWrapper}>
                  <img ref={imageRef} src={imageSrc!} className={styles.image} alt="Image"/>
                  {products?.map((space, index) => {
                    const [y1, x1, y2, x2] = space.box_2d;
                    const filtered = filterProducts(space.recommended_products);
                    if (!filtered || filtered.length === 0) return null;
                    return (
                      <div key={index} className={styles.emptyBox} style={{ top: `${(y1 / 1000) * 100}%`, left: `${(x1 / 1000) * 100}%`,
                        width: `${((x2 - x1) / 1000) * 100}%`, height: `${((y2 - y1) / 1000) * 100}%` }}>
                        <p className={styles.spaceLabel}>{space.space_description}</p>
                        <div className={styles.productScrollRow}>
                          {filtered.map((product: RecommendedProduct, i: number) => (
                            <div key={i} className={styles.productCard}>
                              <img src={`http://localhost:8000${product.image}`} alt="Product Image" className={styles.productImage} />
                              <h3 className={styles.productName}>{product.name}</h3>
                              <h4 className={styles.productCategory}>Category: {product.category}</h4>
                              <p className={styles.productPrice}>${product.price}</p>
                              <p className={styles.productRating}>Ratings: {product.rating}</p>
                              <p className={styles.productReason}>{product.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      );
                  })}
              </div>
          </div>
          )}
        </div>
      )}
        {toast && (
          <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
            {toast.msg}
          </div>
        )}
        </div>
    )
  };


export default Decorate;


