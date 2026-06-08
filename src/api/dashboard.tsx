import BASE_URL from "../utils/baseapi";
import { getToken } from "../utils/tokenUtils";

export const fetchProducts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/products/`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${url}`, { ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return res.json();
};
