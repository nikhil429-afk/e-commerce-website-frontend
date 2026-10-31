// Set VITE_API_URL in .env (e.g. https://api.myshop.com) when you deploy. Locally it falls back to the dev server.
const BASE_URL: string = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

export default BASE_URL;
