import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { getMyRole } from "../services/api.js";

export default function ProtectedRoute({ children, allow }) {
    const { session, loading: authLoading } = useAuth();
    const [roleStatus, setRoleStatus] = useState("loading");

    useEffect(() => {
        if (authLoading || !session) return;

        getMyRole().then(res => {
            if (res?.role && allow.includes(res.role)) {
                setRoleStatus("ok");
            } else {
                setRoleStatus("forbidden");
            }
        });
    }, [session, allow, authLoading]);

    if (authLoading) return <p>Loading...</p>;
    if (!session) return <Navigate to="/login" />;
    if (roleStatus === "loading") return <p>Loading...</p>;
    if (roleStatus === "forbidden") return <Navigate to="/login" />;

    return children;
}
