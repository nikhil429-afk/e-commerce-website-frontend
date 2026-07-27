import { EyeIcon, EyeOffIcon } from "../assets/Extra/svg";
import { useNavigate } from "react-router-dom";
import { getRegister } from "../api/register";
import React, { useState } from "react";
import styles from "./auth.module.css"

interface FormData {
    username: string;
    email: string;
    pwd: string;
    conf_pwd: string;
}

interface ErrorData {
    username?:string;
    email?: string;
    pwd?: string;
    conf_pwd?: string;
    general?: string;
}

function Register(){
    const navigate = useNavigate();

    const [ loading, setLoading ] = useState();
    const [ message, setMessage ] = useState("");
    const [ showPwd, setShowPwd ] = useState(false);
    const [ exiting, setExiting ] = useState(false);
    const [ error, setError ] = useState<ErrorData>({});
    const [ showConfPwd, setShowConfPwd ] = useState(false);
    const [ toast, setToast ] = useState<{ msg: string; ok: boolean } | null>(null);
    const [ form, setForm ] = useState<FormData>({username: "", email: "", pwd: "", conf_pwd: "",})

    const showToastMsg = (msg: string) => {
        setToast({ msg, ok: true });
        setTimeout(() => setToast(null), 4000);
    };

    const handleNavigation = () => {
        setExiting(true);
        setLoading;
        setTimeout(() => navigate("/login"), 200);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedForm = {
            ...form, [name]: value, 
        };
        
        setForm(updatedForm);
        const updatedErrors: ErrorData = { ...error };

        const usernamePattern = /^[a-zA-Z]{3,50}$/;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$#%!]{8,15}$/;
        
        if (name === "username") {
            if (!value.trim()) { updatedErrors.username = "Username should not be Empty!";
            }
            else if (!usernamePattern.test(value)) {
                updatedErrors.username ="Username must be of 3-50 letters Only!";
            }
            else {
                delete updatedErrors.username;
            }
        };
        
        if (name === "email") {
            if (!value.trim()) { updatedErrors.email = "Email should not be Empty!";
            }
            else if (!emailPattern.test(value)) { updatedErrors.email = "Invalid Email Format!";
            }
            else {
                delete updatedErrors.email;
            }
        };
        
        if (name === "pwd") {
            if (!value.trim()) {
                updatedErrors.pwd = "Password should not be Empty!";
            }
            else if (!passwordPattern.test(value)) {
                updatedErrors.pwd = "Password must contain 1 Uppercase, 1 Lowercase, 1 digit & 1 Special Character (8-15 Characters)";
            }
            else {
                delete updatedErrors.pwd;
            }
            
            if ( updatedForm.conf_pwd && updatedForm.conf_pwd !== value) {
                updatedErrors.conf_pwd = "Passwords didn't Match!";
            }
            else {
                delete updatedErrors.conf_pwd;
            }
        };
        
        if (name === "conf_pwd") {
            if (!value.trim()) {
                updatedErrors.conf_pwd = "Confirm Password should not be Empty!";
            }
            else if (value !== updatedForm.pwd) {
                updatedErrors.conf_pwd = "Passwords didn't Match!";
            }
            else {
                delete updatedErrors.conf_pwd;
            }
        };
        setError(updatedErrors);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newError: ErrorData = {};
        
        const usernamePattern = /^[a-zA-Z]{3,50}$/;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$#%!]{8,15}$/;

        if (!form.username) newError.username = "Username cannot be Empty!";
        // if (!form.username) newError.username = "Username cannot have digits!"
        if (!usernamePattern.test(form.username)) newError.username = "Username must be 3-50 letters Only!";

        if (!form.email) newError.email = "Email cannot be Empty!";
        if (!emailPattern.test(form.email)) newError.email = "Email format is Invalid";

        if (!form.pwd) newError.pwd = "Password cannot be Empty!";
        if (!passwordPattern.test(form.pwd)) newError.pwd = "Password must contain 1 Uppercase, 1 Lowercase, 1 digit & 1 Special Character (8-15 Characters)";

        if (!form.conf_pwd) newError.conf_pwd = "Please Confirm Your Password!";
        
        if (form.pwd && form.conf_pwd && form.pwd !== form.conf_pwd) newError.conf_pwd = "Passwords do not Match!";
        setError(newError);

        if(Object.keys(newError).length !== 0) return;

        try {
            const res = await getRegister(form);
            if (!res.ok) {
                if (typeof res.data.detail === "object") {
                    setError(res.data.detail);
                } else {
                    setError({ general: res.data.detail || "Registration Failed" });
                }
                return;
            } else {
                setMessage(res.data.message);
                setError({});
                setForm({ username: "", email: "", pwd: "", conf_pwd: "" });
                showToastMsg("Registration Successful!");
                setTimeout(() => navigate("/login"), 4000);
            }
        } catch (error) {
            console.error("Registration Failed:", error);
                  const res = await getRegister(form);
            setError({ general: res.data.detail || "An Error Occurred. Please Try Again." });
        } finally {
            setLoading;
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={`${styles.container} ${exiting ? styles.exiting : ""}`}>
                    <div className={styles.heading}>
                        <h2 className={styles.cardTitle} data-text="Create Account">Create Account</h2>
                        <p className={styles.subText}>Sign up and Glow Up your life with US.</p>
                        <div className={styles.accentLine}></div>
                    </div>

                    <div className={`${styles.field} ${error.username ? styles.error : ""}`}>
                        <label className={styles.label}>Username : </label>
                        <input name="username" value={form.username} className={styles.input} onChange={handleChange} placeholder="e.g. Johndoe" />
                        {error.username && (
                            <div className={styles.errMsg}>
                                <span className={styles.errDot}></span> {error.username}
                            </div>
                        )}
                    </div>

                    <div className={`${styles.field} ${error.email ? styles.error : ""}`}>
                        <label className={styles.label}>Email Address : </label>
                        <input name="email" value={form.email} className={styles.input} onChange={handleChange} placeholder="john@example.com" />
                        {error.email && (
                            <div className={styles.errMsg}>
                                <span className={styles.errDot}></span> {error.email}
                            </div>
                        )}
                    </div>

                    <div className={`${styles.field} ${styles.hasIcon} ${error.pwd ? styles.error : ""}`}>
                        <label className={styles.label}>Password :</label>
                        <input name="pwd" type={showPwd ? "text" : "password"} value={form.pwd} className={styles.input}
                            onChange={handleChange} placeholder="Min. 8 characters" />
                        <span className={styles.fieldIcon} onClick={() => setShowPwd(!showPwd)} >
                            {showPwd ? <EyeIcon /> : <EyeOffIcon />}
                        </span>
                        {error.pwd && (
                            <div className={styles.errMsg}>
                                <span className={styles.errDot}></span> {error.pwd}
                            </div>
                        )}
                    </div>

                    <div className={`${styles.field} ${styles.hasIcon} ${error.conf_pwd ? styles.error : ""}`}>
                        <label className={styles.label}>Confirm Password :</label>
                        <input name="conf_pwd" type={showConfPwd ? "text" : "password"} value={form.conf_pwd} className={styles.input}
                            onChange={handleChange} placeholder="Re-Enter Your Password" />
                        <span className={styles.fieldIcon} onClick={() => setShowConfPwd(!showConfPwd)} >
                            {showConfPwd ? <EyeIcon /> : <EyeOffIcon />}
                        </span>
                        {error.conf_pwd && (
                            <div className={styles.errMsg}>
                                <span className={styles.errDot}></span> {error.conf_pwd}
                            </div>
                        )}
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? "Creating Your Account..." : "Create Account →"}
                    </button>

                    {toast && (
                        <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
                            {toast.msg}
                        </div>
                    )}
                    {message && <p className={styles.successMessage}>{message}</p>}
                    {error.general && <p className={styles.errorMessage}>{error.general}</p>}

                    <div className={styles.footer}>
                        <span className={styles.footerTxt}>Already Have An Account?</span>
                        <button type="button" onClick={handleNavigation} className={`${styles.link}`} >Log In
                            <span className={styles.linkArrow}>→</span>
                        </button>
                    </div>
                </form>
                <div className={styles.imagePanel} />
            </div>
        </div>
    )
};


export default Register;
