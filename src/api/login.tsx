import BASE_URL from "../utils/baseapi";

interface LoginData {
  email: string;
  pwd: string;
}

export const getLogin = async(form: LoginData) => {
  try {
    const res = await fetch(`${BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({ email: form.email, pwd: form.pwd, }),
    });
    const data = await res.json();
  return { ok: res.ok, status: res.status, data };
  }
  catch (err: any) {
    return { status: 500, data: { message: err.message}};
  }
};

