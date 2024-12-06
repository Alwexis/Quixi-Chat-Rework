import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";

export default function Home() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    return (
        <main className="h-screen w-screen flex bg-neutral-900">
            <section className="h-full flex flex-col justify-between w-32 bg-neutral-800/40">
                <div></div>
                <div>
                    <div></div>
                    <div>
                        <img className="rounded-full w-14" src={user.profile_picture} alt="" />
                    </div>
                </div>
            </section>
        </main>
    );
}
