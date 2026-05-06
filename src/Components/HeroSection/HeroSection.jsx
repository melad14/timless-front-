import { Link } from "react-router-dom";
import "./HeroSection.css";
import chest from "../../assets/images/HeroSection.png";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-topbar">
        <div className="hero-logo">Timeless</div>
        <Link to="/messages" className="skip-button">Skip</Link>
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <h1>Send A Message To Your Future... And Let Time Deliver It</h1>
          <p>
            Timeless lets you craft a message and securely store it until the date you choose.
            Build legacy words, reminders, or secret notes for tomorrow, next year, or decades later.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/howitworks" className="btn-secondary">Learn How It Works</Link>
          </div>
        </div>

        <div className="hero-image-wrap">
          <img src={chest} alt="Treasure chest" className="hero-image" />
        </div>
      </div>
    </section>
  );
}