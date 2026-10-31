import { apiFetch } from "../utils/api";
import { saveToken } from "../utils/tokenUtils";

export interface Profile {
  id: number;
  username: string;
  email: string;
  role: "owner" | "user";
  phone: string;
  address: string;
  auth_provider: "password" | "google" | "both";
  google_linked: boolean;
  avatar_url: string;
  has_password: boolean;
  created_at: string | null;
}

interface SaveResponse {
  message: string;
  user: Profile;
  access_token: string;
}

// After a successful save the server sends a fresh login token (name / email are inside it),
// so the navbar, dashboards and every page pick up the change straight away.
function persist(res: SaveResponse) {
  saveToken(res.access_token);
  const { id, username, email, role, phone, address, avatar_url } = res.user;
  localStorage.setItem("user", JSON.stringify({ id, username, email, role, phone, address, avatar_url }));
}

export const getProfile = () => apiFetch<Profile>("/profile");

export async function updateProfile(data: Partial<Pick<Profile, "username" | "email" | "phone" | "address">>) {
  const res = await apiFetch<SaveResponse>("/profile", { method: "PATCH", json: data });
  persist(res);
  return res;
}

export async function changePassword(data: { current_password?: string; new_password: string; confirm_password: string }) {
  const res = await apiFetch<SaveResponse>("/profile/password", { method: "POST", json: data });
  persist(res);
  return res;
}
