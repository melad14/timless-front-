import { useNavigate } from "react-router-dom";
import aboutHero from "../../assets/images/About.png";
import { isAuthenticated } from "../../services/authService";
import "./About.css";

const ABOUT_COPY =
  "We Created This Space For Memories That Travel Through Time. Write A Message, A Dream, Or A Promise — And Let Your Future Self Open It When The Right Moment Comes. Our Mission Is To Keep Your Emotions Safe Until Tomorrow Is Ready For Them.";

export default function About() {
  const navigate = useNavigate();

  function handleGetStarted() {
    if (isAuthenticated()) {
      navigate("/", { replace: false });
    } else {
      navigate("/register", { replace: false });
    }
  }

  return (
    <main className="about-page">
      <div className="about-inner">
        <div className="about-copy">
          <h1>About Us</h1>
          <p className="about-lead">{ABOUT_COPY}</p>
          <button type="button" className="about-cta" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
        <div className="about-visual">
          <img src={aboutHero} alt="Vintage suitcase with a journey through time" loading="lazy" />
        </div>
      </div>
    </main>
  );
}
