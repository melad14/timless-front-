import React from 'react';
import './Splash.css';
import envelopeImage from '../../assets/images/image-1774271580618.png';

function Splash() {
  return (
    <section className="splash-screen">
      <header className="splash-header">
        <div>
          <h1>Timeless</h1>
          <p>Send a message to your future and let time deliver it.</p>
          <button type="button" className="splash-skip">Skip</button>
        </div>
      </header>

      <main className="splash-main">
        <section className="splash-content">
          <h2>How it works</h2>
          <ol>
            <li>Write your message or record a video.</li>
            <li>Choose the delivery date.</li>
            <li>Save and relax; we deliver it in the future.</li>
          </ol>
        </section>

        <figure className="splash-figure">
          <img src={envelopeImage} alt="Envelope" />
          <figcaption>Secure time-locked envelope</figcaption>
        </figure>
      </main>

      <footer className="splash-details">
        <p>100% width image ensures the splash remains true to your design request.</p>
      </footer>
    </section>
  );
}

export default Splash;
