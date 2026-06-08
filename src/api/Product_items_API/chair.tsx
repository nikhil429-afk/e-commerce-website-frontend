// ALL APIs of Almirahs are Here.
// This file is used to fetch the data of Almirahs from the backend and also to add the Almirahs to the wishlist and cart.

import BASE_URL from "../../utils/baseapi";
import { getToken } from "../../utils/tokenUtils";

type Chair = { 
  id: number;
  name: string;
  images: string[];
  category: string;
  price: number;
  oldPrice: number;
  tag: string;
  rating: number;
  description: string;
  in_stock: boolean;
};

export const getChairs = async () => {
    const res = await fetch(`${BASE_URL}/products/chairs`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`,
        },
    });
    return res.json();
};


export const addToWishlist = async (productId: number) => {
    const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`,
        },
    });
    return res;
};

export const removeFromWishlist = async (itemId: number) => {
    const res = await fetch(`${BASE_URL}/wishlist/${itemId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`,
        },
    });
    return res;
};


export const addToCart = async (product: Chair) => {
    const res = await fetch(`${BASE_URL}/cart/${product.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
    });
    return res;
};


export const removeFromCart = async (product: Chair) => {
    const res = await fetch(`${BASE_URL}/cart/${product.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    });
    return res;
};

