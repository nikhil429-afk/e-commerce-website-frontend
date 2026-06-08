import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../utils/baseapi";
import { saveToken } from "../utils/tokenUtils";

interface FormData {
  email: string;
  pwd: string;
}

interface ErrorData {
  email?: string;
  pwd?: string;
  general?: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ email: "", pwd: "" });
  const [error, setError] = useState<ErrorData>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newError: ErrorData = {};
    if (!form.email) newError.email = "Email cannot be Empty!";
    if (!form.pwd) newError.pwd = "Password cannot be Empty!";
    setError(newError);
    if (Object.keys(newError).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, pwd: form.pwd }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (typeof data.detail === "object") {
          setError(data.detail);
        } else {
          setError({ general: data.detail || "Login failed" });
        }
        return;
      }

      const token: string = data.access_token;
      const role: string = (data.user.role as string).toLowerCase();

      localStorage.setItem("user", JSON.stringify(data.user));
      saveToken(token);

      setMessage("Login Successful!");

      if (role === "owner") {
        navigate("/owner");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login Failed:", err);
      setError({ general: "Login Failed. Please Try Again." });
    } finally {
      setLoading(false);
    }
  };

  return { form, error, message, loading, handleChange, handleSubmit };
}


export function Logout() {
  const navigate = useNavigate();
  
  const logout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); navigate("/login"); };
  return { logout };
};
