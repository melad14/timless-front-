import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/images/profile.jpg";
import { getStoredUser } from "../../services/authService";

export default function Navbar() {
  const location = useLocation();
  const user = getStoredUser();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) return null;

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <span className="brand-icon">⌛</span> Timeless
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === "/messages" ? "active" : ""}`}
                to="/messages"
              >
                Message Box
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about">
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === "/complaints" ? "active" : ""}`}
                to="/complaints"
              >
                Complaints & Suggestions
              </Link>
            </li>
          </ul>

          <div className="profile-section">
            <Link to="/profile" className="profile-link">
              <img src={logo} alt="Profile" className="profile-img" />
              <span className="profile-name">{user?.username || "Guest User"}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}