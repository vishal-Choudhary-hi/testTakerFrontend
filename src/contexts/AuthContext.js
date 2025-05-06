import React, { createContext, useState, useEffect, useRef } from "react";
import apiCall from "../services/api";
import { useSnackbar } from "./SnackbarContext";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { showSnackbar } = useSnackbar();
    const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
    const [user, setUser] = useState({ name: "", email: "", id: null });
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;
        let localAuthToken = localStorage.getItem("authorization")
        if (localAuthToken) {
            setAuthToken(localAuthToken)
            const fetchUser = async () => {
                let setUserData = await userApiCall(showSnackbar);
                setUser(setUserData);
            }
            fetchUser();
        }
    }, []);
    const login = async (newToken) => {
        setAuthToken(newToken);
        localStorage.setItem("authorization", newToken);
        let setUserData = await userApiCall(showSnackbar);
        setUser(setUserData);
    };

    const logout = () => {
        setAuthToken(null);
        localStorage.removeItem("authorization");
    };

    return (
        <AuthContext.Provider value={{ authToken, login, logout, user }}>
            {children}
        </AuthContext.Provider>
    );
};

async function userApiCall(showSnackbar) {
    let response = await apiCall("GET", "user", {}, showSnackbar);
    return ({
        "emailId": response.data ? response.data.emailId : "",
        "name": response.data ? response.data.name : "",
        "id": response.data ? response.data.id : null,
    });
}