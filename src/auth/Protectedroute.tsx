import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import TokenExpiredModal from "./TokenExpiredModal";
import { getToken, getUserRole, isTokenExpired, clearToken } from "../utils/tokenUtils";

type Role = "owner" | "user";
type Props = { children: React.ReactNode; allowedRole: Role };

function ProtectedRoute({ children, allowedRole }: Props) {
  const [showExpired, setShowExpired] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const rawToken = localStorage.getItem("auth_token");
    if (rawToken && isTokenExpired()) {
      clearToken();
      setShowExpired(true);
    }
  }, []);

  if (redirect) {
    return <Navigate to="/login" replace />;
  }

  if (showExpired) {
    return (
      <TokenExpiredModal
        onClose={() => {
          setShowExpired(false);
          setRedirect(true);
        }}
      />
    );
  }

  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}


export default ProtectedRoute;
