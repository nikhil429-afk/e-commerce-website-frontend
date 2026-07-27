import { getToken } from "../utils/tokenUtils";
import BASE_URL from "../utils/baseapi";


const formatDate = (date: any) => {
    try{
        if (!date) return "";
        if (date.toDate) { return date.toDate().toISOString(); }
        if (typeof date === "string") { return new Date(date).toISOString(); }
        return date.toISOString();
    }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const getOrdersChart = async (startDate: any, endDate: any) => {
    try{
        const start = formatDate(startDate);
        const end = formatDate(endDate);

        const res = await fetch(`${BASE_URL}/owner/orders/chart?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
            method: "GET",
            headers: {Authorization: "Bearer " + getToken(),},
        });
        if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
        return res.json();
    }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


export const getUsersChart = async (startDate: any, endDate: any) => {
    try{
        const start = formatDate(startDate);
        const end = formatDate(endDate);

        const res = await fetch(`${BASE_URL}/owner/users/chart?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
            method: "GET",
            headers: {Authorization: "Bearer " + getToken(),},
        });
        if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
        return res.json();
    }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};


// export const getVisitorsChart = async (startDate: any, endDate: any) => {
//     const start = formatDate(startDate);
//     const end = formatDate(endDate);

//     const res = await fetch(`${BASE_URL}/owner/visitors/chart?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
//         method: "GET",
//         headers: {Authorization: "Bearer " + getToken(),},
//     });
//     if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
//     return res.json();
// };