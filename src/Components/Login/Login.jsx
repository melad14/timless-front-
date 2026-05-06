import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Login.css";
import { login } from "../../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const registeredMessage = location.state?.registered
    ? "Account created successfully. Please login."
    : "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-container login-container">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <p className="login-subtitle">Welcome Back!</p>
        {registeredMessage ? <div className="success-message">{registeredMessage}</div> : null}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-input"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="forgot-password">
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>Or</span>
        </div>

        {/* Sign Up Link */}
        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="signup-link">
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  );
}
