import React, { createContext, useState, useEffect, useRef } from "react";
import apiCall from "../services/api";
import { useSnackbar } from "./SnackbarContext";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { showSnackbar } = useSnackbar();
    const navigate = useNavigate(); // ✅ Hook used at top level
    const [authToken, setAuthToken] = useState(localStorage.getItem("authorization"));
    const [user, setUser] = useState({ name: "", email: "", id: null });
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        const localAuthToken = localStorage.getItem("authorization");
        if (localAuthToken) {
            setAuthToken(localAuthToken);
            const fetchUser = async () => {
                const userData = await userApiCall(showSnackbar);
                if (userData.id === null) {
                    navigate("/login"); // ✅ Navigate if user is not valid
                    return;
                }
                setUser(userData);
                navigate("/dashboard"); // ✅ Navigate to dashboard if user is valid
            };
            fetchUser();
        }
    }, [navigate, showSnackbar]);

    const login = async (newToken) => {
        setAuthToken(newToken);
        localStorage.setItem("authorization", newToken);
        const userData = await userApiCall(showSnackbar);
        setUser(userData);
    };

    const logout = () => {
        setAuthToken(null);
        localStorage.removeItem("authorization");
        navigate("/login"); // Optional: navigate on logout
    };

    return (
        <AuthContext.Provider value={{ authToken, login, logout, user }}>
            {children}
        </AuthContext.Provider>
    );
};

async function userApiCall(showSnackbar) {
    const response = await apiCall("GET", "user", {}, showSnackbar);
    if (response.status === false) {
        showSnackbar("error", response.message || "Failed to fetch user data");
        return { emailId: "", name: "", id: null };
    }
    return {
        emailId: response.data?.emailId || "",
        name: response.data?.name || "",
        id: response.data?.id || null,
    };
}
