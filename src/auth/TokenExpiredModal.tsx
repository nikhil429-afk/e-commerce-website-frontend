import React from "react";
import { useNavigate } from "react-router-dom";

interface TokenExpiredModalProps { onClose?: () => void }

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 99999,
  padding: "16px",
};

const boxStyle: React.CSSProperties = {
  background: "var(--c-surface)",
  border: "1px solid var(--c-line)",
  borderRadius: "16px",
  padding: "clamp(1.5rem, 5vw, 2.5rem) clamp(1.25rem, 5vw, 2rem)",
  maxWidth: "420px",
  width: "100%",
  maxHeight: "100%",
  overflowY: "auto",
  textAlign: "center",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  animation: "fadeInScale 0.3s ease",
};

const iconStyle: React.CSSProperties = {
  fontSize: "3rem",
  marginBottom: "0.75rem",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.4rem",
  fontWeight: 700,
  color: "var(--c-ink)",
  marginBottom: "0.5rem",
};

const msgStyle: React.CSSProperties = {
  color: "var(--c-muted)",
  fontSize: "0.95rem",
  marginBottom: "1.5rem",
  lineHeight: 1.6,
};

const btnStyle: React.CSSProperties = {
  background: "var(--brand)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.75rem 1.75rem",
  minHeight: "44px",
  margin: "4px",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.2s",
};

function TokenExpiredModal({ onClose }: TokenExpiredModalProps) {
  const navigate = useNavigate();

  const handleReLogin = () => {
    if (onClose) onClose();
    navigate("/login");
  };

  return (
    <div style={overlayStyle}>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={boxStyle}>
        <div style={iconStyle}>🪙</div>
        <h3 style={titleStyle}>Session Expired</h3>
        <p style={msgStyle}>Your session has expired after 3 hours of Inactivity. Please log in again to Continue.</p>
        <button style={btnStyle} onMouseEnter={e => (e.currentTarget.style.background = "var(--brand-strong)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--brand)")} onClick={handleReLogin}>Login
        </button>
        <button style={{ ...btnStyle, background: "var(--c-surface-2)", color: "var(--c-ink)", border: "1px solid var(--c-line)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--c-bg-alt)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--c-surface-2)")} onClick={onClose}>Cancel
        </button>
      </div>
    </div>
  );
}

export default TokenExpiredModal;
