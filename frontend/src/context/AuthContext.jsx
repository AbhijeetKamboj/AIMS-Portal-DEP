/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const s = supabase.auth.getSession();
        s.then(({ data }) => {
            setSession(data.session);
            localStorage.setItem("session", JSON.stringify(data.session));
            // Load role from localStorage if available
            const storedRole = localStorage.getItem("userRole");
            if (storedRole) setRole(storedRole);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            localStorage.setItem("session", JSON.stringify(session));
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ session, role, setRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
