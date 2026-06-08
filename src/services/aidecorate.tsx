import React, { useState, useEffect, useRef } from 'react';
import { Upload,  } from '../assets/Extra/svg';
import { getImage } from '../api/aidecorate';
import styles from "./decorate.module.css"


function Decorate() {

    
    const [search, setSearch] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
    const [modalFading, setModalFading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {

    }, []);

    const openUploadModal = () => { setUploadFile(null); setUploadProgress(0); setUploadStatus("idle"); setShowUploadModal(true); };
    const closeUploadModal = () => { setShowUploadModal(false); setUploadFile(null); setUploadProgress(0); setUploadStatus("idle"); };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
        if (file) { setUploadFile(file); setUploadStatus("idle"); }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
        if (file) { setUploadFile(file); setUploadStatus("idle"); }
    };

    const handleUploadSubmit = async () => {
        if (!uploadFile) return;
        setUploadStatus("uploading"); setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(p => { if (p >= 90) { clearInterval(interval); return p; } return p + Math.floor(Math.random() * 12) + 4; });
        }, 160);
        try {
            const formData = new FormData();
            formData.append("file", uploadFile);
            const res = await getImage();
            clearInterval(interval);
            setUploadProgress(100); setUploadStatus("done");
        } catch {
            clearInterval(interval); setUploadStatus("error");
        }
    };

    const smoothCloseUploadModal = () => {
        setModalFading(true);
        setTimeout(() => { setModalFading(false); closeUploadModal(); }, 300);
    };
  
    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return(
    <div>

        <div className={styles.card}>
          <div className={styles.cardTitle}> Room Decoration With Our AI </div>
          <div className={styles.cardSub}> Upload Room Images and Get your Room Decorated With AI </div>
          <button onClick={openUploadModal} className={styles.uploadBtn}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(99,102,241,0.48)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(99,102,241,0.35)"; }}>
            <Upload /> Upload Room Image
          </button>
        </div>
        {showUploadModal && (
          <div onClick={e => e.target === e.currentTarget && smoothCloseUploadModal()}
            className={styles.uploadModalOverlay}
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
                onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={styles.dropZone}
                style={{
                  borderColor: dragOver ? "#6366f1" : uploadFile ? "#10b981" : "rgba(255,255,255,0.12)",
                  background: dragOver ? "rgba(99,102,241,0.06)" : uploadFile ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                }}>
                <input ref={fileInputRef} type="file" name="file_upload" style={{ display: "none" }} onChange={handleFileInput} />
                {uploadFile ? (
                  <div>
                    <div className={styles.fileEmoji}>📄</div> <div className={styles.fileName}>{uploadFile.name}</div>
                    <div className={styles.fileSize}> {formatBytes(uploadFile.size)} </div>
                    <div className={styles.fileReady}>✓ Upload Now — Click To Replace</div>
                  </div>
                ) : (
                  <div>
                    <div className={styles.dropIconWrap}><Upload /></div>
                    <div className={styles.dropTitle} >Drop Your File Here</div>
                    <div className={styles.dropSub}>or <span className={styles.dropBrowse}>Browse Files</span></div>
                  </div>
                )}
              </div>
              {uploadStatus === "uploading" && (
                <div className={styles.progressWrap}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Uploading...</span><span className={styles.progressPct}>{uploadProgress} %</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
              {uploadStatus === "done" && <div className={styles.uploadSuccess}>✓ File Uploaded Successfully!</div>}
              {uploadStatus === "error" && <div className={styles.uploadError}>✕ Upload Failed! Please Try Again ↻</div>}
              <div className={styles.uploadModalFooter}>
                {uploadStatus === "done" ? (
                  <button onClick={smoothCloseUploadModal} className={styles.doneBtnGreen}>Done</button>
                ) : (
                  <button onClick={handleUploadSubmit} disabled={!uploadFile || uploadStatus === "uploading"}
                    className={(!uploadFile || uploadStatus === "uploading") ? styles.uploadSubmitDisabled : styles.uploadSubmit}>
                    {uploadStatus === "uploading" ? "Uploading…" : "Upload File"}
                  </button>
                )}
                <button onClick={smoothCloseUploadModal} className={styles.uploadCancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        <div className={styles.Container}>
            {loading ? <p className={styles.loading}>Loading Image...</p> : (
                <div>

                </div>
            )}
        </div>
    </div>
    )
};

export default Decorate;