import { useContext } from "react";
import { UserContext } from "../context/user.context";
import * as authApi from "../services/auth.api";

export const useAuth = () => {
    const { user, setUser, loading, setLoading } = useContext(UserContext);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authApi.login({ email, password });
            localStorage.setItem("token", data.token);
            setUser(data.user);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password) => {
        setLoading(true);
        try {
            const data = await authApi.register({ email, password });
            localStorage.setItem("token", data.token);
            setUser(data.user);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error("Backend logout failed:", err);
        } finally {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    const getAllUsers = async () => {
        return await authApi.getAllUsers();
    };

    return { user, loading, login, register, logout, getAllUsers };
};
