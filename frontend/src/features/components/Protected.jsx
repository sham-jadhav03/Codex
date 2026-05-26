import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

export const Protected = ({ children }) => {
    const { user, loading } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            const token = localStorage.getItem("token");
            if (!token || !user) {
                navigate("/login");
            }
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>{children}</>
    );
};
