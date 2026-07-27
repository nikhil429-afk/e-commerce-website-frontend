import BASE_URL from "../utils/baseapi";
import { getToken } from "../utils/tokenUtils";

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`,
  };
};


export const getFetchCart = async (token: string) => {
  try {
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


export const getWishlist = async () => {
  try {
    const res = await fetch(`${BASE_URL}/wishlist/`,{
      method: "GET",
      headers: authHeaders()
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

export const addToWishlist = async (itemId: number) => {
  try {
    const res = await fetch(`${BASE_URL}/wishlist/${itemId}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

export const removeFromWishlist = async (itemId: number) => {
  try {
    const res = await fetch(`${BASE_URL}/wishlist/${itemId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};
