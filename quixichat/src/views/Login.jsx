import React, { useState, useEffect } from "react";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";

export default function Login() {
    setPersistence(auth, browserLocalPersistence);
    const { user, loading } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
    });
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState("login");
    const [validForm, setValidForm] = useState(true);
    const navigate = useNavigate();

    const handleClick = async (e) => {
        const activeTab = document.querySelector('[data-state="active"]');
        if (activeTab === e.target) return;
        activeTab.dataset.state = "inactive";
        e.target.dataset.state = "active";
        setActiveTab(e.target.dataset.tab);
        setErrors((prev) =>
            e.target.dataset.tab === "login"
                ? { email: prev.email, password: prev.password }
                : {
                      email: prev.email,
                      password: prev.password,
                      username: prev.username,
                  }
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(e.target.parentElement, name, value);
    };

    const validateField = (el, name, value) => {
        let error = "";
        if (name === "email" && !/\S+@\S+\.\S+/.test(value)) {
            error = "Debes ingresar un correo electrónico válido.";
            el.dataset.invalid = true;
        } else if (name === "password" && value.length < 6) {
            error = "La contraseña debe tener al menos 6 caracteres.";
            el.dataset.invalid = true;
        } else if (name === "username" && value.length < 3) {
            error = "El nombre de usuario debe tener al menos 3 caracteres.";
            el.dataset.invalid = true;
        } else {
            el.dataset.invalid = null;
        }

        setErrors({ ...errors, [name]: error });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (activeTab == "login") {
            await handleLogin(e);
        } else {
            await handleRegister(e);
        }
    };

    const handleLogin = async (e) => {
        try {
            await signInWithEmailAndPassword(
                auth,
                formData["email"],
                formData["password"]
            );
            navigate("/");
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                password:
                    "Credenciales incorrectas. Por favor, verifica e intenta de nuevo.",
            }));
        }
    };

    const handleRegister = async (e) => {
        try {
            await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                }),
            });
            navigate("/");
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                email: "El correo ya está en uso. Prueba con otro.",
            }));
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const { email, displayName, photoURL } = result.user;
            await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    username: displayName,
                    photoURL: photoURL.replace("=s96-c", ""),
                }),
            });
            navigate("/");
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                email: "Hubo un problema al iniciar sesión con Google.",
            }));
        }
    };

    const showPassword = (e) => {
        const password = document.getElementById("password");
        password.type = password.type == "password" ? "text" : "password";
    };

    useEffect(() => {
        const hasErrors = Object.values(errors).some((error) => error !== "");
        const isEmpty =
            activeTab === "login"
                ? !formData.email || !formData.password
                : !formData.email || !formData.password || !formData.username;
        setValidForm(!hasErrors && !isEmpty);
    }, [formData, errors, activeTab]);

    if (loading) {
        return <Loading />;
    }

    return (
        <main className="h-screen w-screen flex items-center justify-center bg-main">
            <section className="bg-neutral-900 max-w-xs md:max-w-sm w-full px-8 py-6 border border-neutral-700 rounded-md shadow-md">
                <h2 className="text-2xl font-semibold text-center text-neutral-100">
                    Quixichat
                </h2>
                <p className="text-sm my-2 text-neutral-200">
                    {activeTab == "login"
                        ? "Inicia sesión en Quixichat utilizando tu correo electrónico y contraseña, o con Google."
                        : "Crea una cuenta en Quixichat para comenzar a chatear con tus amigos."}
                </p>
                <div
                    role="tablist"
                    aria-orientation="horizontal"
                    className="h-10 items-center justify-center rounded-md bg-neutral-800 mt-4 p-1 text-neutral-100 grid w-full grid-cols-2"
                >
                    <button
                        onClick={handleClick}
                        type="button"
                        role="tab"
                        data-tab="login"
                        data-state="active"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-neutral-700 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-300 data-[state=active]:shadow-sm"
                        data-orientation="horizontal"
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={handleClick}
                        type="button"
                        role="tab"
                        data-tab="register"
                        data-state="inactive"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-neutral-700 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-300 data-[state=active]:shadow-sm"
                        data-orientation="horizontal"
                    >
                        Registrarse
                    </button>
                </div>
                <form
                    className="bg-transparent my-2 w-full"
                    onSubmit={handleFormSubmit}
                >
                    {activeTab == "register" && (
                        <div className="flex items-center data-[invalid=true]:placeholder-red-400 data-[invalid=true]:border-red-400 data-[invalid=true]:text-red-400 transition-all rounded-md w-full px-2 text-neutral-300 border border-neutral-700 bg-neutral-800 mt-1.5 animate-fade">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M12 12q-1.65 0-2.825-1.175T8 8t1.175-2.825T12 4t2.825 1.175T16 8t-1.175 2.825T12 12m-8 8v-2.8q0-.85.438-1.562T5.6 14.55q1.55-.775 3.15-1.162T12 13t3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20z"
                                />
                            </svg>
                            <input
                                onChange={handleChange}
                                type="text"
                                name="username"
                                id="username"
                                className="h-10 text-sm placeholder-neutral-400 outline-none w-full bg-transparent ml-2"
                                placeholder="Username"
                            />
                        </div>
                    )}
                    {errors["username"] != "" && (
                        <p className="text-red-400 text-xs mb-2">
                            {errors["username"]}
                        </p>
                    )}
                    <div className="flex items-center data-[invalid=true]:placeholder-red-400 data-[invalid=true]:border-red-400 data-[invalid=true]:text-red-400 transition-all rounded-md w-full px-2 text-neutral-300 border border-neutral-700 bg-neutral-800 mt-1.5 animate-fade">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12v1.45q0 1.475-1.012 2.513T18.5 17q-.875 0-1.65-.375t-1.3-1.075q-.725.725-1.638 1.088T12 17q-2.075 0-3.537-1.463T7 12t1.463-3.537T12 7t3.538 1.463T17 12v1.45q0 .65.425 1.1T18.5 15t1.075-.45t.425-1.1V12q0-3.35-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20h5v2zm0-7q1.25 0 2.125-.875T15 12t-.875-2.125T12 9t-2.125.875T9 12t.875 2.125T12 15"
                            />
                        </svg>
                        <input
                            onChange={handleChange}
                            type="text"
                            name="email"
                            id="email"
                            className="h-10 text-sm placeholder-neutral-400 outline-none w-full bg-transparent ml-2"
                            placeholder="Email"
                        />
                    </div>
                    {errors["email"] != "" && (
                        <p className="text-red-400 text-xs mb-2">
                            {errors["email"]}
                        </p>
                    )}
                    <div className="flex items-center data-[invalid=true]:placeholder-red-400 data-[invalid=true]:border-red-400 data-[invalid=true]:text-red-400 transition-all rounded-md w-full px-2 text-neutral-300 border border-neutral-700 bg-neutral-800 mt-1.5 animate-fade">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M2 19v-2h20v2zm1.15-6.05l-1.3-.75l.85-1.5H1V9.2h1.7l-.85-1.45L3.15 7L4 8.45L4.85 7l1.3.75L5.3 9.2H7v1.5H5.3l.85 1.5l-1.3.75l-.85-1.5zm8 0l-1.3-.75l.85-1.5H9V9.2h1.7l-.85-1.45l1.3-.75l.85 1.45l.85-1.45l1.3.75l-.85 1.45H15v1.5h-1.7l.85 1.5l-1.3.75l-.85-1.5zm8 0l-1.3-.75l.85-1.5H17V9.2h1.7l-.85-1.45l1.3-.75l.85 1.45l.85-1.45l1.3.75l-.85 1.45H23v1.5h-1.7l.85 1.5l-1.3.75l-.85-1.5z"
                            />
                        </svg>
                        <input
                            onChange={handleChange}
                            type="password"
                            name="password"
                            id="password"
                            className="h-10 text-sm placeholder-neutral-400 outline-none w-full bg-transparent ml-2"
                            placeholder="Contraseña"
                        />
                        <svg
                            onClick={showPassword}
                            className="cursor-pointer"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"
                            />
                        </svg>
                    </div>
                    {errors["password"] != "" && (
                        <p className="text-red-400 text-xs mb-2">
                            {errors["password"]}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={!validForm}
                        className="h-10 cursor-pointer disabled:cursor-not-allowed border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 hover:border-neutral-800 disabled:bg-neutral-700 transition-all text-neutral-200 w-full mt-4 rounded-md font-semibold"
                    >
                        {activeTab == "login"
                            ? "Iniciar Sesión"
                            : "Registrarse"}
                    </button>
                </form>
                {activeTab == "login" && (
                    <div className="animate-fade">
                        <div className="flex items-center my-2">
                            <div className="w-full h-[1px] bg-neutral-700"></div>
                            <span className="mx-2 text-neutral-300">o</span>
                            <div className="w-full h-[1px] bg-neutral-700"></div>
                        </div>
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center text-neutral-200 border border-neutral-700 py-2 hover:bg-red-500 transition-all font-semibold rounded-md"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M3.064 7.51A10 10 0 0 1 12 2c2.695 0 4.959.991 6.69 2.605l-2.867 2.868C14.786 6.482 13.468 5.977 12 5.977c-2.605 0-4.81 1.76-5.595 4.123c-.2.6-.314 1.24-.314 1.9s.114 1.3.314 1.9c.786 2.364 2.99 4.123 5.595 4.123c1.345 0 2.49-.355 3.386-.955a4.6 4.6 0 0 0 1.996-3.018H12v-3.868h9.418c.118.654.182 1.336.182 2.045c0 3.046-1.09 5.61-2.982 7.35C16.964 21.105 14.7 22 12 22A9.996 9.996 0 0 1 2 12c0-1.614.386-3.14 1.064-4.49"
                                />
                            </svg>
                            <span className="ml-2">
                                Iniciar sesión con Google
                            </span>
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
