import BASE_URL from "../utils/baseapi";
import { getToken } from "../utils/tokenUtils";

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
};

export const getFetchWishlist = async (token: string) => {
  try {
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

export const getCart = async () => {
  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: "GET",
      headers: authHeaders() }
    );
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

export const addToCart = async (productId: number) => {
  try {
    const res = await fetch(`${BASE_URL}/cart/${productId}`, {
      method: "PUT",
      headers: authHeaders(),
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

export const removeFromCart = async (itemId: number) => {
  try {
    const res = await fetch(`${BASE_URL}/cart/delete/${itemId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

export const increaseQuantity = async (itemId: number) => {
  try {
    const res = await fetch(`${BASE_URL}/cart/increase/${itemId}`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

export const decreaseQuantity = async (itemId: number) => {
  try {
    const res = await fetch(`${BASE_URL}/cart/decrease/${itemId}`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const clearCart = async () => {
  try {
    const res = await fetch(`${BASE_URL}/cart/clear`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const checkoutItem = async (itemId: number) => {
  try {
    const res = await fetch(`${BASE_URL}/orders/checkout/${itemId}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return res;
  }
  catch (err: any) {
    throw new Error(err.message || "Checkout failed");
  }
};


export const checkoutCart = async () => {
  try {
    const res = await fetch(`${BASE_URL}/orders/checkout`, {
      method: "POST",
      headers: authHeaders(),
    });
    return res;
  }
  catch (err: any) {
    throw new Error(err.message || "Checkout failed");
  }
};


export const getCartItemCount = async () => {
  try {
    const res = await fetch(`${BASE_URL}/cart/count`, {
      method: "GET",
      headers: authHeaders(),
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

