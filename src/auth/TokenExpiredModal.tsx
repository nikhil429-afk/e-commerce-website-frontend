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
};

const boxStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "16px",
  padding: "2.5rem 2rem",
  maxWidth: "420px",
  width: "90%",
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
  color: "#1a1a2e",
  marginBottom: "0.5rem",
};

const msgStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "0.95rem",
  marginBottom: "1.5rem",
  lineHeight: 1.6,
};

const btnStyle: React.CSSProperties = {
  background: "#c28246",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.75rem 2rem",
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
        <button style={btnStyle} onMouseEnter={e => (e.currentTarget.style.background = "#a0692e")}
          onMouseLeave={e => (e.currentTarget.style.background = "#c28246")} onClick={handleReLogin}>Login
        </button>
        <button style={{ ...btnStyle, background: "#eee", color: "#333", marginLeft: "1rem" }} onMouseEnter={e => (e.currentTarget.style.background = "#ddd")}
          onMouseLeave={e => (e.currentTarget.style.background = "#eee")} onClick={onClose}>Cancel
        </button>
      </div>
    </div>
  );
}

export default TokenExpiredModal;
