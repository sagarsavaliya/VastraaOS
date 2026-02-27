import React from 'react';
import { Navigate } from 'react-router-dom';

// The /verify route was used for the old email-token verification flow.
// OTP verification is now handled inline on the signup page (Step 3).
// Redirect anyone landing here to /signup.
const VerificationPage = () => {
    return <Navigate to="/signup" replace />;
};

export default VerificationPage;
