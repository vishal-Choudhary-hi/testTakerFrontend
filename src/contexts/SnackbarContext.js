import React, { createContext, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
    const showSnackbar = (message, type = "error") => {
        toast(message, {
            type,
            position: "top-right",
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            theme: "light",
        });
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <ToastContainer />
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = () => useContext(SnackbarContext);
