import "./HowItWorks.css";
import stepOne from "../../assets/images/HowItWorksss.png";
import stepTwo from "../../assets/images/HowItWorkss.png";
import stepThree from "../../assets/images/HowItWorks.png";

export default function HowItWorks() {
  return (
    <section className="howitworks-container">
      <div className="howitworks-inner">
        <h1>How It Works</h1>
        <div className="howitworks-steps">
          <article className="step-card">
            <img src={stepOne} alt="Write message" />
            <h4>1. Write Your Message Or Make A Video</h4>
            <p>Capture your voice, story, or feelings and tell your future self what matters today.</p>
          </article>

          <article className="step-card">
            <img src={stepTwo} alt="Choose date" />
            <h4>2. Choose A Date</h4>
            <p>Select the delivery date and let the system safely store it until that moment arrives.</p>
          </article>

          <article className="step-card">
            <img src={stepThree} alt="Leave rest to us" />
            <h4>3. Leave The Rest To Us</h4>
            <p>Our secure engine will ensure your message arrives exactly when you planned.</p>
          </article>
        </div>

        <a className="btn-getstarted" href="/register">Get Started</a>
      </div>
    </section>
  );
}
