import BASE_URL from "../utils/baseapi"
import { getToken } from "../utils/tokenUtils";



export const sendContact = async (data: any) => {
  try{
    const res = await fetch(`${BASE_URL}/contact/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error("Failed to send message");
    }
    return res.json();
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};
