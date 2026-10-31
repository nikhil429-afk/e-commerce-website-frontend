import { apiFetch } from "../utils/api";

export const getAllUsers = () => apiFetch("/owner/users");

export const deleteUser = (userId: number) => apiFetch(`/owner/users/${userId}`, { method: "DELETE" });

export const updateUser = (userId: number, data: { username?: string; role?: string }) =>
  apiFetch(`/owner/users/${userId}`, { method: "PATCH", json: data });

export const getProducts = () => apiFetch("/owner/products");

export const createProduct = (formData: FormData) => apiFetch("/products/", { method: "POST", form: formData });

export const updateProduct = (id: number, formData: FormData) => apiFetch(`/products/${id}`, { method: "PUT", form: formData });

export const deleteProduct = (productId: number) => apiFetch(`/owner/products/${productId}`, { method: "DELETE" });

export const getOrders = () => apiFetch("/owner/orders");

export const shipOrder = (orderId: number, status: string) => apiFetch(`/owner/orders/${orderId}`, { method: "PATCH", json: { status } });

export const getContacts = () => apiFetch("/owner/contact");

export const getAppointments = () => apiFetch("/owner/appointments");
