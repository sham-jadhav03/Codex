import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

export const Protected = ({ children }) => {
    const { user, setLoading, loading } = useContext(UserContext);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setLoading(false);
        }

        if (!token) {
            navigate("/login");
        }

        if (!user) {
            navigate("/login");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-white">Loading...</div>
        </div>;
    }

    return (
        <>{children}</>
    );
};
