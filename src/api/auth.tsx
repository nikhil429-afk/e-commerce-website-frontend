import { getLogin } from "./login";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [form, setForm] = useState<FormData>({ email: "", pwd: "", });
  const [error, setError] = useState<ErrorData>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev, [name]: value,
    }));

    setError((prev) => {
      const updatedErrors = { ...prev };

      if (name === "email") {
        if (value.trim()) {
          delete updatedErrors.email;
        } else {
          updatedErrors.email = "Email cannot be Empty!";
        }
      }
      if (name === "pwd") {
        if (value.trim()) { delete updatedErrors.pwd; }
        else { updatedErrors.pwd = "Password cannot be Empty!"; }
      }
      return updatedErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newError: ErrorData = {};

    if (!form.email.trim()) { newError.email = "Email cannot be Empty!"; }

    if (!form.pwd.trim()) { newError.pwd = "Password cannot be Empty!"; }

    setError(newError);

    if (Object.keys(newError).length > 0) { return; }

    setLoading(true);
    try {
      const res = await getLogin(form);
      if (!res.ok) {
        if (typeof res.detail === "object") {
          setError(res.detail);
        } else {
          setError({
            general: res.detail || "Login failed",
          });
        }
        return;
      }

      const token: string = res.access_token;
      const role: string = (res.user.role as string).toLowerCase();

      localStorage.setItem("user", JSON.stringify(res.user));
      saveToken(token);

      setMessage("Login Successful!");

      if (role === "owner") {
        navigate("/owner");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login Failed:", err);

      setError({
        general: "Login Failed. Please Try Again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return { form, error, message, loading, handleChange, handleSubmit };
}


export function Logout() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem("auth_token"); localStorage.removeItem("user"); navigate("/login"); };
  return { logout };
};
