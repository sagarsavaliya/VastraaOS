import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    login as apiLogin,
    logout as apiLogout,
    verifyLoginOtp as apiVerifyLoginOtp,
    resendLoginOtp as apiResendLoginOtp,
} from '../pages/Dashboard/services/dashboardService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    /**
     * Login with email + password.
     * Returns { success: true } on direct login,
     * { success: false, requiresOtp: true } when 2FA is enabled,
     * or { success: false, error: string } on failure.
     */
    const login = async (email, password) => {
        try {
            const response = await apiLogin(email, password);

            if (response.requires_otp) {
                return { success: false, requiresOtp: true };
            }

            const { token: authToken, user: userData } = response;
            setToken(authToken);
            setUser(userData);
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('auth_user', JSON.stringify(userData));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                requiresOtp: false,
                error: error.response?.data?.message || 'Login failed. Please try again.',
            };
        }
    };

    /**
     * Verify the 2FA OTP after login. Issues and stores the token on success.
     */
    const verifyOtp = async (email, otp) => {
        try {
            const response = await apiVerifyLoginOtp(email, otp);
            const { token: authToken, user: userData } = response;

            setToken(authToken);
            setUser(userData);
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('auth_user', JSON.stringify(userData));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Verification failed. Please try again.',
            };
        }
    };

    /**
     * Resend login OTP.
     */
    const resendOtp = async (email) => {
        try {
            await apiResendLoginOtp(email);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Could not resend code.',
            };
        }
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
    };

    const updateUser = (data) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...data };

            if (data.tenant && prevUser.tenant) {
                updatedUser.tenant = { ...prevUser.tenant, ...data.tenant };
            }

            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        verifyOtp,
        resendOtp,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
