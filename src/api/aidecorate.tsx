import BASE_URL from "../utils/baseapi";
import { getToken } from "../utils/tokenUtils";



export const UploadImage = async (formData: FormData) => {
    return fetch(`${BASE_URL}/ai-decorate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
    });
};


