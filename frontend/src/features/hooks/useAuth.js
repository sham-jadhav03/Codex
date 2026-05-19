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

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return { user, loading, login, register, logout };
};
