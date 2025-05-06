import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Home = () => {
    const { authToken } = useContext(AuthContext);
    const navigate = useNavigate();
    if (authToken) {
        navigate('/dashboard');
    }
    return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center bg-light">
            <h1 className="display-4 text-primary" style={{ fontFamily: "Poppins, sans-serif" }}>Welcome to Test Taker</h1>
            <p className="lead text-secondary" style={{ fontFamily: "Poppins, sans-serif" }}>
                The ultimate platform for taking exams with AI assistance.
            </p>
        </div>
    );
};

export default Home;
