import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, onboarding = false, adminOnly = false }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    // Role-based authorization
    if (adminOnly && !user?.is_super_admin) {
        return <Navigate to="/" replace />;
    }

    // Super Admins don't need onboarding
    if (user?.is_super_admin) {
        return children;
    }

    // Check onboarding status for tenant users
    // If tenant is missing or onboarding_completed is not explicitly true, redirect to onboarding
    const needsOnboarding = user?.tenant?.onboarding_completed !== true;

    // Safety check: if user object exists but tenant data is missing (not yet loaded or error)
    // for a regular user, we should probably show a loader or redirect to onboarding
    if (!user?.is_super_admin && !user?.tenant) {
        // If we are already on onboarding, let it through so it can try to fetch/setup
        if (!onboarding) {
            return <Navigate to="/onboarding" replace />;
        }
    }

    if (needsOnboarding && !onboarding) {
        return <Navigate to="/onboarding" replace />;
    }

    if (!needsOnboarding && onboarding) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
