import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../services/authService";
import "./Register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function onChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formData.username || !formData.email || !formData.phone_number || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!agree) {
      setError("You must agree to the terms and privacy policy");
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-container register-container">
      <div className="register-card">
        <h1 className="register-title">Sign Up</h1>
        <p className="register-subtitle">Create New Account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Full Name
            </label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username"
                name="username"
                className="form-input"
                type="text"
                placeholder="Enter Your Full Name"
                value={formData.username}
                onChange={onChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Adress
            </label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                id="email"
                name="email"
                className="form-input"
                type="email"
                placeholder="Enter Your Email"
                value={formData.email}
                onChange={onChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone_number" className="form-label">
              Phone Number
            </label>
            <div className="input-wrapper">
              <span className="input-icon">📞</span>
              <input
                id="phone_number"
                name="phone_number"
                className="form-input"
                type="tel"
                placeholder="Enter Your Phone Number"
                value={formData.phone_number}
                onChange={onChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                name="password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                value={formData.password}
                onChange={onChange}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
          </div>

          <div className="terms-group">
            <input
              id="terms"
              type="checkbox"
              className="terms-checkbox"
              checked={agree}
              onChange={(event) => setAgree(event.target.checked)}
              disabled={loading}
            />
            <label htmlFor="terms" className="terms-label">
              I&apos;ve Read And Agree With The Terms <br />
              And Conditions And The Privacy Policy.
            </label>
          </div>

          <button type="submit" className="btn-signup" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link className="signup-link" to="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}