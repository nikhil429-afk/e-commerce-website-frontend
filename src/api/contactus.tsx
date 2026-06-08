import BASE_URL from "../utils/baseapi"
import { getToken } from "../utils/tokenUtils";

const token = getToken();


export const sendContact = async (data: any) => {
  const res = await fetch(`${BASE_URL}/contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to send message");
  }
  return res.json();
};
