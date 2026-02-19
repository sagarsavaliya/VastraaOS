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
import OnboardingWizard from './pages/OnboardingWizard';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import TenantManagement from './pages/SuperAdmin/Tenants';
import AdminManagement from './pages/SuperAdmin/Admins';
import Settings from './pages/Settings';
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

              {/* Onboarding Route */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute onboarding={true}>
                    <OnboardingWizard />
                  </ProtectedRoute>
                }
              />

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
                <Route path="settings" element={<Settings />} />

                {/* Super Admin Routes */}
                <Route path="admin" element={<ProtectedRoute adminOnly={true}><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
                <Route path="admin/dashboard" element={<ProtectedRoute adminOnly={true}><SuperAdminDashboard /></ProtectedRoute>} />
                <Route path="admin/tenants" element={<ProtectedRoute adminOnly={true}><TenantManagement /></ProtectedRoute>} />
                <Route path="admin/admins" element={<ProtectedRoute adminOnly={true}><AdminManagement /></ProtectedRoute>} />
                <Route path="admin/settings" element={<ProtectedRoute adminOnly={true}><div style={{ padding: '2rem' }}>System Config (Coming Soon)</div></ProtectedRoute>} />

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
