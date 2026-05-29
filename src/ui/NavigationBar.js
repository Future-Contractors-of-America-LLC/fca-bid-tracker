import React from 'react';
import { Link } from 'react-router-dom';

export default function NavigationBar() {
  return (
    <nav className="navigation-bar">
      <Link to="/">Home</Link>
      <Link to="/platform">Platform</Link>
      <Link to="/academy">Academy</Link>
      <Link to="/auricrux">Auricrux</Link>
      <Link to="/pricing">Pricing</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/login">Login</Link>
      <Link to="/portal">Portal</Link>
    </nav>
  );
}
