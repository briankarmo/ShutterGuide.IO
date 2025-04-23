// components/InvalidLink.js
import React from 'react';
import { Link } from 'react-router-dom';

const InvalidLink = () => {
  return (
    <div className="container">
      <h2>Invalid or Expired Link</h2>
      <p>
        The password reset link you clicked is invalid or has expired. 
        Please request a new password reset link.
      </p>
      <Link to="/forgot-password" className="button">
        Request New Reset Link
      </Link>
    </div>
  );
};

export default InvalidLink;