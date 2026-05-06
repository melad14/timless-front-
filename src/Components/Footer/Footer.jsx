import React from 'react';

const Footer = () => (
  <footer className="bg-dark text-light py-3 mt-4">
    <div className="container text-center small">
      <p className="mb-1">Timeless &copy; {new Date().getFullYear()}</p>
      <p className="mb-0">Built for scheduling messages into the future.</p>
    </div>
  </footer>
);

export default Footer;
