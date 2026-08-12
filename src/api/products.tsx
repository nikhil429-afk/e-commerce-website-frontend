import BASE_URL from '../utils/baseapi';
import { getToken } from '../utils/tokenUtils';

export const getProducts = async () => {
    try{
        const res = await fetch(`${BASE_URL}/products`);
        return res.json();
    }
    catch (err: any) {
        return { status: 500, data: { message: err.message}};
    }
};


export const updateProduct = async (id: number, data: any) => {
    try {
        const res = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    }
    catch (err: any) {
        return { status: 500, data: { message: err.message}};
    }
};


// export const getdetailView = async (id: number) => {
//     const res = await fetch(`${BASE_URL}/products/${id}`);
//     return res.json();
// };


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


export const getAddToCart = async (productId: number, token: string) => {
    try {
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


export const getAddToWishlist = async (productId: number, token: string) => {
    try {
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


export const getDeleteFromWishlist = async (productId: number, token: string) => {
    try {
        const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        return res.json();
    }
    catch (err: any) {
        return { status: 500, data: { message: err.message}};
    }
};


export const getSofas = async () => {
    try {
        const res = await fetch(`${BASE_URL}/sofas`, {
            method: "GET",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    }
    catch (err: any) {
        return { status: 500, data: { message: err.message}};
    }
};


export const getBeds = async () => {
    try {
        const res = await fetch(`${BASE_URL}/beds`, {
            method: "GET",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
        }
    catch (err: any) {
        return { status: 500, data: { message: err.message}};
    }
};


export const getChairs = async () => {
    try {
        const res = await fetch(`${BASE_URL}/chairs`, {
            method: "GET",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
    return res.json();
    }
    catch (err: any) {
        return { status: 500, data: { message: err.message}};
    }
};


export const getTables = async () => {
    try {
        const res = await fetch(`${BASE_URL}/Tables`, {
            method: "GET",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    }
    catch (err: any) {
        return { status: 500, data: { message: err.message}};
    }
};


export const getAlmirahs = async () => {
    try {
        const res = await fetch(`${BASE_URL}/almirahs`, {
            method: "GET",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    }
    catch (err: any) {
        return { status: 500, data: { message: err.message}};
    }
};


export const getDinings = async () => {
    try {
        const res = await fetch(`${BASE_URL}/dinings`, {
            method: "GET",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    }
    catch (err: any) {
        return { status: 500, data: { message: err.message}};
    }
};

