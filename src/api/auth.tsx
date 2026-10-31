import { getLogin } from "./login";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken, clearToken } from "../utils/tokenUtils";

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
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    setForm((prev) => ({
      ...prev, [name]: value, }));

      const updatedErrors: ErrorData = { ...error };

      if (name === "email"){
        if (!value.trim()) {
          updatedErrors.email = "Email should not be Empty!";
        }
        else if (!emailPattern.test(value)){
          updatedErrors.email = "Invalid Email Format";
        }
        else {
          delete updatedErrors.email;
        }
      }
      if (name === "pwd") {
        if (!value.trim()) {
          updatedErrors.pwd = "Password should not be Empty!";
        }
        else {
          delete updatedErrors.pwd;
        }
    }
    setError(updatedErrors);
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const newError: ErrorData = {};
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!form.email.trim()) {
    newError.email = "Email cannot be Empty!";
  }
  else if (!emailPattern.test(form.email)) {
    newError.email = "Email format is Invalid";
  }

  if (!form.pwd.trim()) {
    newError.pwd = "Password cannot be Empty!";
  }

  setError(newError);
  if (Object.keys(newError).length > 0) return;
  setLoading(true);

  try {
    const res = await getLogin(form);
    if (!res.ok) {const detail = res?.data?.detail;
      setError({ general: typeof detail === "string" ? detail : detail?.pwd || detail?.email || res?.data?.message ||
        "Wrong Email or Password", });
      return;
    }
    if (!res?.data?.access_token || !res?.data?.user) {
      throw new Error("Invalid response received from server.");
    }

    const token = res.data.access_token;
    const user = res.data.user;
    const role = user.role?.toLowerCase();

    localStorage.setItem("user", JSON.stringify(user));
    saveToken(token);
    setMessage("Login Successful!");

    if (role === "owner") {
      navigate("/owner");
    } else {
      navigate("/");
    }
  } catch (err: any) {
    console.error("Login Error:", err);

    setError({ general: err?.message || "Something went wrong. Please try again.", });
  } finally {
    setLoading(false);
  }
};

  return { form, error, message, loading, handleChange, handleSubmit };
}


export function Logout() {
  const navigate = useNavigate();
  const logout = () => { clearToken(); navigate("/login"); };
  return { logout };
};
