import BASE_URL from "../utils/baseapi";
import { getToken } from "../utils/tokenUtils";


function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
};

export const getImage = async () => {
    const res = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        headers: authHeaders(),
    });
    return res.json;
};