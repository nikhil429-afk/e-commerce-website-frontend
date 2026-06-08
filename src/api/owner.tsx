import { getToken } from "../utils/tokenUtils";
import BASE_URL from "../utils/baseapi";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};


export const getAllUsers = async () => {
    const res = await fetch(`${BASE_URL}/owner/users`, {
      method: "GET",
      headers: authHeaders(),
    });
    return res.json();
};


export const deleteUser = async (userId: number) => {
  const res = await fetch(`${BASE_URL}/owner/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};


export const updateUser = async (userId: number, data: { username?: string; role?: string }) => {
  const res = await fetch(`${BASE_URL}/owner/users/${userId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};


export const getProducts = async () => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/owner/products`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};


export const createProduct = async (formData: FormData) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/products/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};


export const updateProduct = async (id: number, formData: FormData) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};


export const deleteProduct = async (productId: number) => {
  const res = await fetch(`${BASE_URL}/owner/products/${productId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};


export const getOrders = async () => {
  const res = await fetch(`${BASE_URL}/owner/orders/`, {
    method: "GET",
    headers: authHeaders() });
  return res.json();
};


export const shipOrder = async (orderId: number) => {
  const res = await fetch(`${BASE_URL}/owner/orders/${orderId}`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
};


export const getContacts = async () => {
  const res = await fetch(`${BASE_URL}/owner/contact`, {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
};


export const getAppointments = async () => {
  const res = await fetch(`${BASE_URL}/owner/appointments`, {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
};

