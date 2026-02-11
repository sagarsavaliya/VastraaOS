import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/UI/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Inquiries from './pages/Inquiries';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Workflow from './pages/Workflow';
import Workers from './pages/Workers';
import ThemeBuilder from './pages/ThemeBuilder';
import SignIn from './pages/SignIn';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/signin" element={<SignIn />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="inquiries" element={<Inquiries />} />
                <Route path="customers" element={<Customers />} />
                <Route path="orders" element={<Orders />} />
                <Route path="workflow" element={<Workflow />} />
                <Route path="workers" element={<Workers />} />
                <Route path="billing" element={<div style={{ padding: '2rem' }}>Billing & Invoices (Coming Soon)</div>} />
                <Route path="reports" element={<div style={{ padding: '2rem' }}>Business Reports (Coming Soon)</div>} />
                <Route path="theme-builder" element={<ThemeBuilder />} />
                <Route path="settings" element={<div style={{ padding: '2rem' }}>Settings (Coming Soon)</div>} />
                <Route path="*" element={<div style={{ padding: '2rem' }}>Page not found</div>} />
              </Route>
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
