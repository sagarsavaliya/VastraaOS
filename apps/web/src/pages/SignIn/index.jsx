import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LogIn, Mail, Lock, AlertCircle, Loader2,
    Zap, ShieldCheck, Sparkles, RefreshCw,
} from 'lucide-react';
import { ModernInput, ModernButton } from '../../components/UI/CustomInputs';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const SignIn = () => {
    const navigate = useNavigate();
    const { login, verifyOtp, resendOtp } = useAuth();

    // Credentials step
    const [formData, setFormData] = useState({
        email: 'owner@demo.naariarts.com',
        password: 'demo@123',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // OTP step
    const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendCount, setResendCount] = useState(0);
    const otpRefs = useRef([]);

    // Resend countdown
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    // Auto-focus first OTP box when OTP step appears
    useEffect(() => {
        if (step === 'otp') {
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        setApiError('');
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setApiError('');
        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/');
        } else if (result.requiresOtp) {
            // 2FA required — switch to OTP entry
            setResendCooldown(RESEND_COOLDOWN);
            setStep('otp');
        } else {
            setApiError(result.error);
        }
        setLoading(false);
    };

    // OTP handlers
    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        setOtpError('');
        if (value && index < OTP_LENGTH - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill('');
        pasted.split('').forEach((char, i) => { next[i] = char; });
        setOtp(next);
        otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length < OTP_LENGTH) {
            setOtpError('Please enter the full 6-digit code.');
            return;
        }
        setOtpLoading(true);
        setOtpError('');
        const result = await verifyOtp(formData.email, code);
        if (result.success) {
            navigate('/');
        } else {
            setOtpError(result.error);
            setOtp(Array(OTP_LENGTH).fill(''));
            otpRefs.current[0]?.focus();
        }
        setOtpLoading(false);
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || resendCount >= 3) return;
        const result = await resendOtp(formData.email);
        if (result.success) {
            setResendCount(c => c + 1);
            setResendCooldown(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(''));
            otpRefs.current[0]?.focus();
            setOtpError('');
        } else {
            setOtpError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden p-8">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse duration-[5s]" />

            <div className="flex-1 flex items-center justify-center">
                <div className="flex w-full max-w-7xl px-6 gap-12 lg:gap-24 relative z-10">
                    {/* Left Side — Brand */}
                    <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center">
                        <div className="inline-flex items-center justify-center w-30 h-30 p-4 bg-surface border border-border/50 rounded-[3rem] mb-8 shadow-2xl shadow-primary/20 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/10 group-hover:scale-150 transition-transform duration-1000" />
                            <LogIn size={40} className="text-primary relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                        </div>
                        <div className="space-y-4 mb-12">
                            <h1 className="text-7xl font-black text-text-main tracking-tighter italic">
                                VASTRAA<span className="text-primary">OS</span>
                            </h1>
                            <p className="text-xs font-black text-text-muted uppercase tracking-[0.5em]">Enterprise Fabric Intelligence</p>
                        </div>
                        <div className="space-y-6 max-w-md">
                            {[
                                { icon: Zap, title: 'Lightning Fast', desc: 'Streamline your entire production workflow with real-time tracking' },
                                { icon: ShieldCheck, title: 'Enterprise Security', desc: 'Bank-grade encryption protecting your business data' },
                                { icon: Sparkles, title: 'Smart Analytics', desc: 'AI-powered insights for better business decisions' },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex items-start gap-4 p-6 bg-surface/40 backdrop-blur-xl rounded-2xl border border-border/30">
                                    <Icon size={24} className="text-primary flex-shrink-0 mt-1" />
                                    <div className="text-left">
                                        <h3 className="text-sm font-bold text-text-main mb-2">{title}</h3>
                                        <p className="text-xs text-text-muted">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side — Form */}
                    <div className="flex-1 flex items-center justify-center max-w-xl mx-auto lg:mx-0">
                        <div className="w-full bg-surface/40 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-10 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700">
                            {/* Mobile brand */}
                            <div className="lg:hidden text-center mb-10">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-surface border border-border/50 rounded-[2rem] mb-4 shadow-2xl shadow-primary/20">
                                    <LogIn size={32} className="text-primary" />
                                </div>
                                <h1 className="text-4xl font-black text-text-main tracking-tighter italic mb-2">
                                    VASTRAA<span className="text-primary">OS</span>
                                </h1>
                            </div>

                            {/* Credentials step */}
                            {step === 'credentials' && (
                                <>
                                    <div className="mb-10 text-center">
                                        <h2 className="text-xl font-bold text-text-main">Authentication Hub</h2>
                                        <p className="text-sm text-text-muted mt-2">Access the secure management matrix</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {apiError && (
                                            <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-300">
                                                <AlertCircle size={24} className="text-rose-500 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Access Denied</p>
                                                    <p className="text-sm font-semibold text-text-secondary">{apiError}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            <ModernInput
                                                label="System Identification (Email)"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                icon={Mail}
                                                placeholder="name@vaastra.io"
                                                error={errors.email}
                                                disabled={loading}
                                            />
                                            <ModernInput
                                                label="Security Protocol (Password)"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                icon={Lock}
                                                placeholder="••••••••"
                                                error={errors.password}
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <ModernButton
                                                type="submit"
                                                variant="primary"
                                                size="lg"
                                                icon={ShieldCheck}
                                                className="w-full !py-2 shadow-xl shadow-primary/25"
                                                loading={loading}
                                            >
                                                ESTABLISH CONNECTION
                                            </ModernButton>
                                        </div>
                                    </form>

                                    <div className="mt-12 pt-10 border-t border-border/30">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={14} className="text-primary animate-pulse" />
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Matrix Preview Mode</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-background-content/10 rounded-2xl border border-border/50">
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Login</p>
                                                <p className="text-xs font-bold text-text-main truncate">owner@demo.naariarts.com</p>
                                            </div>
                                            <div className="p-4 bg-background-content/10 rounded-2xl border border-border/50">
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Token</p>
                                                <p className="text-xs font-bold text-text-main">demo@123</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* OTP step */}
                            {step === 'otp' && (
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mx-auto mb-6">
                                            <ShieldCheck className="text-primary" size={30} />
                                        </div>
                                        <h2 className="text-xl font-bold text-text-main">Two-Factor Verification</h2>
                                        <p className="text-sm text-text-muted mt-2">
                                            Enter the 6-digit code sent to <span className="text-text-main font-semibold">{formData.email}</span>
                                        </p>
                                    </div>

                                    {/* OTP boxes */}
                                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={el => (otpRefs.current[i] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpChange(i, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                                className={`w-12 h-14 text-center text-xl font-black bg-surface/40 rounded-2xl border outline-none transition-all text-text-main
                                                    ${otpError ? 'border-red-500' : digit ? 'border-primary' : 'border-border focus:border-primary'}`}
                                            />
                                        ))}
                                    </div>

                                    {otpError && (
                                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                                            <AlertCircle size={18} className="text-rose-500 flex-shrink-0" />
                                            <p className="text-sm text-rose-400 font-semibold">{otpError}</p>
                                        </div>
                                    )}

                                    <ModernButton
                                        variant="primary"
                                        size="lg"
                                        icon={ShieldCheck}
                                        className="w-full !py-2 shadow-xl shadow-primary/25"
                                        loading={otpLoading}
                                        onClick={handleVerifyOtp}
                                        disabled={otpLoading || otp.join('').length < OTP_LENGTH}
                                    >
                                        VERIFY & SIGN IN
                                    </ModernButton>

                                    <div className="flex items-center justify-center gap-4 text-sm">
                                        <button
                                            onClick={handleResendOtp}
                                            disabled={resendCooldown > 0 || resendCount >= 3}
                                            className="font-black text-primary uppercase tracking-widest text-xs flex items-center gap-1 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <RefreshCw size={12} />
                                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : resendCount >= 3 ? 'Limit reached' : 'Resend Code'}
                                        </button>
                                        {resendCount > 0 && resendCount < 3 && (
                                            <span className="text-text-muted text-xs">{3 - resendCount} attempt{3 - resendCount !== 1 ? 's' : ''} left</span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => { setStep('credentials'); setOtp(Array(OTP_LENGTH).fill('')); setOtpError(''); }}
                                        className="w-full text-xs font-black text-text-muted uppercase tracking-widest hover:text-text-main transition-colors"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 py-8 flex flex-col items-center gap-4 opacity-30">
                <div className="flex items-center gap-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Build 2.4.0-Stable</span>
                    <div className="w-1 h-1 rounded-full bg-text-muted" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Quantum Encrypted</span>
                </div>
                <p className="text-[10px] font-bold text-center tracking-widest text-text-muted">
                    © 2026 NAARI ARTS ECOSYSTEMS. ALL RIGHTS RESERVED.
                </p>
            </div>
        </div>
    );
};

export default SignIn;
