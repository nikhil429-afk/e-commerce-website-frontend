import BASE_URL from "../utils/baseapi";
import { getToken } from "../utils/tokenUtils";

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export const getWishlist = async () => {
  const res = await fetch(`${BASE_URL}/wishlist/`, { headers: authHeaders() });
  return res.json();
};

export const addToWishlist = async (itemId: number) => {
  const res = await fetch(`${BASE_URL}/wishlist/${itemId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
};

export const removeFromWishlist = async (itemId: number) => {
  const res = await fetch(`${BASE_URL}/wishlist/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};
