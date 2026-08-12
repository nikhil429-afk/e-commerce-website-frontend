import { getToken } from "../utils/tokenUtils";
import BASE_URL from "../utils/baseapi";

export const getAllUsers = async () => {
  try{
    const res = await fetch(`${BASE_URL}/owner/users`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}`,}
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const deleteUser = async (userId: number) => {
  try {
    const res = await fetch(`${BASE_URL}/owner/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}`,}
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const updateUser = async (userId: number, data: { username?: string; role?: string }) => {
  try {
    const res = await fetch(`${BASE_URL}/owner/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`},
      body: JSON.stringify(data),
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const getProducts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/owner/products`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}`,}
    });
  return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const createProduct = async (formData: FormData) => {
  try {
    const res = await fetch(`${BASE_URL}/products/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
  return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const updateProduct = async (id: number, formData: FormData) => {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const deleteProduct = async (productId: number) => {
  try {
    const res = await fetch(`${BASE_URL}/owner/products/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}`,}
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const getOrders = async () => {
  try {
    const res = await fetch(`${BASE_URL}/owner/orders`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}`,}
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const shipOrder = async (orderId: number, status: string) => {
  try{
    const res = await fetch(`${BASE_URL}/owner/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`},
      body: JSON.stringify({ status })
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const getContacts = async () => {
  try{
    const res = await fetch(`${BASE_URL}/owner/contact`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}`,}
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const getAppointments = async () => {
  try {
    const res = await fetch(`${BASE_URL}/owner/appointments`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}`,}
    });
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

