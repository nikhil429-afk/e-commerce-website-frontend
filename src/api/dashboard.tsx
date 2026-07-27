import BASE_URL from "../utils/baseapi";
import { getToken } from "../utils/tokenUtils";

export const fetchProducts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/products/`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try{
    const token = getToken();
    const res = await fetch(`${BASE_URL}${url}`, { ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

export const getFetchCart = async (token: string) => {
  try{
    const res = await fetch(`${BASE_URL}/cart`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

export const getAddToCart = async (productId: number, token: string) => {
  try{
    const res = await fetch(`${BASE_URL}/cart/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`},
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const getFetchWishlist = async (token: string) => {
  try{
    const res = await fetch(`${BASE_URL}/wishlist`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const getAddToWishlist = async (productId: number, token: string) => {
  try{
    const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};