import BASE_URL from "../utils/baseapi";

interface FormData {
    username: string;
    email: string;
    pwd: string;
    conf_pwd: string;
}

export const getRegister = async(form: FormData) => {
    try {
        const res = await fetch(`${BASE_URL}/register/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: form.username,
                email: form.email,
                pwd: form.pwd,
                conf_pwd: form.conf_pwd,
            })
        })
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
    }
    catch (err: any) {
        return { status: 500, data: { message: err.message}};
    }
};