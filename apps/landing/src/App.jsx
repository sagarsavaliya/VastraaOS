import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import VerificationPage from './pages/VerificationPage';
import SignIn from './pages/SignIn';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="verify" element={<VerificationPage />} />
          <Route path="signin" element={<SignIn />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
