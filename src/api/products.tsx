import BASE_URL from '../utils/baseapi';


export const getProducts = async () => {
    const res = await fetch(`${BASE_URL}/products`);
    return res.json();
};


export const updateProduct = async (id: number, data: any) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res.json();
};


export const getdetailView = async (id: number) => {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    return res.json();
};


export const getFetchCart = async (token: string) => {
    const res = await fetch(`${BASE_URL}/cart`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
};


export const getAddToCart = async (productId: number, token: string) => {
    const res = await fetch(`${BASE_URL}/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`}
    });
    return await res.json();
};


export const getRemoveFromCart = async (productId: number, token: string) => {
    const res = await fetch(`${BASE_URL}/cart/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
    return res.json();
};


export const getAddToWishlist = async (productId: number, token: string) => {
    const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
    return res.json();
};


export const getDeleteFromWishlist = async (productId: number, token: string) => {
    const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
    return res.json();
};


export const getSofas = async () => {
    const res = await fetch(`${BASE_URL}/sofas`);
    return res.json();
};


export const getBeds = async () => {
    const res = await fetch(`${BASE_URL}/beds`);
    return res.json();
};


export const getChairs = async () => {
    const res = await fetch(`${BASE_URL}/chairs`);
    return res.json();
};


export const getTables = async () => {
    const res = await fetch(`${BASE_URL}/Tables`);
    return res.json();
};


export const getAlmirahs = async () => {
    const res = await fetch(`${BASE_URL}/almirahs`);
    return res.json();
};


export const getDinings = async () => {
    const res = await fetch(`${BASE_URL}/dinings`);
    return res.json();
};

