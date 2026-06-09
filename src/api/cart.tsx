import BASE_URL from "../utils/baseapi";
import { getToken } from "../utils/tokenUtils";

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
};

export const getCart = async () => {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: "GET",
    headers: authHeaders() }
  );
  return res.json();
};

export const addToCart = async (productId: number) => {
  const res = await fetch(`${BASE_URL}/cart/${productId}`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return res.json();
};

export const removeFromCart = async (itemId: number) => {
  const res = await fetch(`${BASE_URL}/cart/delete/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};

export const increaseQuantity = async (itemId: number) => {
  const res = await fetch(`${BASE_URL}/cart/increase/${itemId}`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
};

export const decreaseQuantity = async (itemId: number) => {
  const res = await fetch(`${BASE_URL}/cart/decrease/${itemId}`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
};


export const clearCart = async () => {
  const res = await fetch(`${BASE_URL}/cart/clear`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};


export const checkoutItem = async (itemId: number) => {
  const res = await fetch(`${BASE_URL}/orders/checkout/${itemId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res;
};


export const checkoutCart = async () => {
  const res = await fetch(`${BASE_URL}/orders/checkout`, {
      method: "POST",
      headers: authHeaders(),
  });
  return res;
};


export const getCartItemCount = async () => {
  const res = await fetch(`${BASE_URL}/cart/count`, {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
};

