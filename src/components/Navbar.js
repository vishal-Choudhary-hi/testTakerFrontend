import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import { AuthContext } from "../contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { authToken, logout } = useContext(AuthContext);

  const handleLogOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light shadow-sm"
      style={{ backgroundColor: "#d7e9ff", fontFamily: "Poppins, sans-serif" }}
    >
      <div className="container">
        {/* Logo */}
        <img
          src={logo}
          alt="Logo"
          className="img-fluid me-3"
          style={{ height: "50px", cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        />

        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu Items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-3">
            <li className="nav-item">
              <Link className="nav-link gradient-btn" to="/about">
                About
              </Link>
            </li>
            <li className="nav-item">
              {!authToken ? (
                <Link className="nav-link gradient-btn" to="/login">
                  Login
                </Link>
              ) : (
                <button
                  className="btn nav-link gradient-btn border-0 bg-transparent"
                  onClick={handleLogOut}
                >
                  Logout
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
