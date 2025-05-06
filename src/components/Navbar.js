import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import { AuthContext } from "../contexts/AuthContext";

const Navbar = () => {
    const navigate = useNavigate();
    const { authToken, logout } = useContext(AuthContext);
    const handleLogOut = () => {
        logout();
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: "#d7e9ff", fontFamily: "Poppins, sans-serif" }}>
            <div className="container">
                {/* Navbar Toggler for Mobile */}
                <img
                    src={logo}
                    alt="Home"
                    className="img-fluid mx-3"
                    style={{ height: "50px", cursor: "pointer" }}
                    onClick={() => navigate("/")}
                />
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Items */}
                <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            {!authToken ? (
                                <Link className="nav-link gradient-btn" to="/login">
                                    Login
                                </Link>
                            ) : (
                                <Link className="nav-link gradient-btn" to="/" onClick={handleLogOut}>
                                    Logout
                                </Link>
                            )}
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link gradient-btn" to="/about">
                                About
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
