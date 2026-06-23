import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

// Import images
import splash1 from '../../assets/images/splash 1.jpeg';
import splash2 from '../../assets/images/splash 2.jpeg';
import chestImg from '../../assets/images/Splash.png';
import handImg from '../../assets/images/hand.jpeg';
import calendarImg from '../../assets/images/calender.jpeg';
import rocketImg from '../../assets/images/rocket.jpeg';

export default function Splash() {
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (slide < 3) {
      setSlide(slide + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('splashSeen', 'true');
    navigate('/login');
  };

  return (
    <div className="splash-container">
      {/* Slide 0: Closed Envelope */}
      {slide === 0 && (
        <div className="slide slide-envelope" onClick={handleNext}>
          <div className="envelope-wrapper">
            <img src={splash1} alt="Envelope Closed" className="envelope-img animate-envelope" />
          </div>
          <button className="nav-arrow" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
            <span className="arrow-icon">➔</span>
          </button>
        </div>
      )}

      {/* Slide 1: Open Envelope */}
      {slide === 1 && (
        <div className="slide slide-envelope" onClick={handleNext}>
          <div className="envelope-wrapper relative-wrapper">
            <img src={splash2} alt="Envelope Open" className="envelope-img animate-envelope" />
            <div className="envelope-text animate-fade-in">
              Time kept this<br />message safe for you
            </div>
          </div>
          <button className="nav-arrow" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
            <span className="arrow-icon">➔</span>
          </button>
        </div>
      )}

      {/* Slide 2: Intro (Desktop-7) */}
      {slide === 2 && (
        <div className="slide slide-intro">
          <header className="slide-header">
            <div className="brand">
              <span className="brand-icon">⌛</span> Timeless
            </div>
            <button className="skip-btn" onClick={handleComplete}>Skip</button>
          </header>
          <div className="slide-body grid-2">
            <div className="col-left">
              <h1 className="intro-title animate-fade-in">Send A Message To Your Future... And Let Time Deliver It</h1>
              <p className="intro-subtitle animate-fade-in delay-1">
                Timeless Lets You Craft A Message And Securely Store It Until The Date You Choose
              </p>
              <div className="btn-group animate-fade-in delay-2">
                <button className="btn btn-primary" onClick={handleNext}>Get Started</button>
                <button className="btn btn-secondary" onClick={handleNext}>Learn How It Work</button>
              </div>
            </div>
            <div className="col-right animate-fade-in">
              <img src={chestImg} alt="Locked Chest" className="chest-img" />
            </div>
          </div>
        </div>
      )}

      {/* Slide 3: How it Works (Desktop-6) */}
      {slide === 3 && (
        <div className="slide slide-how-it-works">
          <header className="slide-header">
            <div className="brand">
              <span className="brand-icon">⌛</span> Timeless
            </div>
          </header>
          <div className="slide-body">
            <h1 className="section-title animate-fade-in">How It Works</h1>
            <div className="steps-container grid-3">
              <div className="step-card animate-fade-in delay-1">
                <div className="img-container">
                  <img src={handImg} alt="Log In" className="step-img" />
                </div>
                <p className="step-desc">1. Log In Or Create Account</p>
              </div>
              <div className="step-card animate-fade-in delay-2">
                <div className="img-container">
                  <img src={rocketImg} alt="Leave Message" className="step-img" />
                </div>
                <p className="step-desc">2. Leave Your Message</p>
              </div>
              <div className="step-card animate-fade-in delay-3">
                <div className="img-container">
                  <img src={calendarImg} alt="Choose Date" className="step-img" />
                </div>
                <p className="step-desc">3. Choose Date & Recipient Details</p>
              </div>
            </div>
            <div className="btn-footer animate-fade-in delay-4">
              <button className="btn btn-primary btn-large" onClick={handleComplete}>Get Started</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
