import { jwtDecode } from "jwt-decode";

export const TOKEN_KEY = "auth_token";

interface DecodedToken {
  id: number;
  username: string;
  email: string;
  role: "owner" | "user";
  exp?: number;
  type?: string;
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      clearToken();
      return null;
    }
    return token;
  } catch {
    clearToken();
    return null;
  }
}

export function getTokenPayload(): DecodedToken | null {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
}

export function getUserRole(): "owner" | "user" | null {
  return getTokenPayload()?.role ?? null;
}

export function isTokenExpired(): boolean {
  return getToken() === null;
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("user");
}
