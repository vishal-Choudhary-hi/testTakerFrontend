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

  const handleNavLinkClick = () => {
    const collapseEl = document.getElementById("navbarNav");
    if (collapseEl?.classList.contains("show")) {
      const bsCollapse = new window.bootstrap.Collapse(collapseEl, {
        toggle: true,
      });
      bsCollapse.toggle();
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg bg-body-tertiary shadow-sm"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="container">
        {/* Brand Logo */}
        <Link to="/dashboard" className="navbar-brand d-flex align-items-center">
          {/* <img
            src={logo}
            alt="Logo"
            className="img-fluid me-2"
            style={{ height: "45px" }}
          /> */}
          <span className="fw-semibold fs-5 text-primary">TestEra</span>
        </Link>

        {/* Toggler Button */}
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

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-3">
            <li className="nav-item">
              <Link
                to="/about"
                className="nav-link text-dark px-3"
                onClick={handleNavLinkClick}
              >
                About
              </Link>
            </li>
            <li className="nav-item">
              {!authToken ? (
                <Link
                  to="/login"
                  className="btn btn-outline-primary px-4 rounded-pill"
                  onClick={handleNavLinkClick}
                >
                  Login
                </Link>
              ) : (
                <button
                  className="btn btn-primary px-4 rounded-pill"
                  onClick={() => {
                    handleLogOut();
                    handleNavLinkClick();
                  }}
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
