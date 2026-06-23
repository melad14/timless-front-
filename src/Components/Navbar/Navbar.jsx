import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/images/profile.jpg";
import { getStoredUser } from "../../services/authService";

export default function Navbar() {
  const location = useLocation();
  const user = getStoredUser();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const [isOpen, setIsOpen] = useState(false);

  if (isAuthPage) return null;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" onClick={handleClose}>
          <span className="brand-icon">⌛</span> Timeless
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarContent">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/" onClick={handleClose}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === "/messages" ? "active" : ""}`}
                to="/messages"
                onClick={handleClose}
              >
                Message Box
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about" onClick={handleClose}>
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === "/complaints" ? "active" : ""}`}
                to="/complaints"
                onClick={handleClose}
              >
                Complaints & Suggestions
              </Link>
            </li>
            {user?.is_admin && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === "/admin/complaints" ? "active" : ""}`}
                  to="/admin/complaints"
                  onClick={handleClose}
                >
                  لوحة الشكاوي
                </Link>
              </li>
            )}
          </ul>

          <div className="profile-section">
            <Link to="/profile" className="profile-link" onClick={handleClose}>
              <img src={logo} alt="Profile" className="profile-img" />
              <span className="profile-name">{user?.username || "Guest User"}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}