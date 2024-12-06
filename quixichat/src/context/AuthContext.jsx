import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

// Crear un contexto
const AuthContext = createContext();

// Proveedor de contexto para envolver la aplicación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();  // Obtén la instancia de Firebase Authentication

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            const _ = await fetch(`http://localhost:3000/auth/user?email=${user.email}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${user.accessToken}`, 
                }
            });
            const _user = await _.json()
            setLoading(false);
            setUser(_user);
        });

        return () => unsubscribe();
    }, [auth]);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para acceder al contexto
export const useAuth = () => {
    return useContext(AuthContext);
};
