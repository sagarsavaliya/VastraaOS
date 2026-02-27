import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Building2,
    User,
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    ChevronLeft,
    ShieldCheck,
    RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { WEB_APP_URL } from '../services/api';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const SignUp = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingSubdomain, setCheckingSubdomain] = useState(false);
    const [subdomainAvailable, setSubdomainAvailable] = useState(null);

    const [formData, setFormData] = useState({
        business_name: '',
        subdomain: '',
        owner_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // OTP state
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendCount, setResendCount] = useState(0);
    const otpRefs = useRef([]);

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    // Resend countdown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    // Debounced subdomain check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.subdomain.length >= 3) {
                checkSubdomain(formData.subdomain);
            } else {
                setSubdomainAvailable(null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.subdomain]);

    const checkSubdomain = async (sub) => {
        setCheckingSubdomain(true);
        try {
            const response = await api.get(`/auth/check-subdomain?subdomain=${sub}`);
            setSubdomainAvailable(response.data.available);
            if (!response.data.available) {
                setErrors(prev => ({ ...prev, subdomain: 'This subdomain is already taken' }));
            } else {
                setErrors(prev => ({ ...prev, subdomain: null }));
            }
        } catch {
            setSubdomainAvailable(false);
            setErrors(prev => ({ ...prev, subdomain: 'Could not check subdomain. Please try again.' }));
        } finally {
            setCheckingSubdomain(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        setApiError('');
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.business_name) newErrors.business_name = 'Business name is required';
        if (!formData.subdomain) newErrors.subdomain = 'Subdomain is required';
        if (subdomainAvailable === false) newErrors.subdomain = 'Subdomain is unavailable';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.owner_name) newErrors.owner_name = 'Your name is required';
        if (!formData.email) newErrors.email = 'Valid email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) setStep(2);
    };

    const prevStep = () => setStep(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;
        setLoading(true);
        setApiError('');
        try {
            await api.post('/auth/register', formData);
            setResendCooldown(RESEND_COOLDOWN);
            setStep(3);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // OTP input handlers
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
        try {
            await api.post('/auth/verify-otp', { email: formData.email, otp: code });
            setStep(4);
        } catch (error) {
            setOtpError(error.response?.data?.message || 'Verification failed. Please try again.');
            setOtp(Array(OTP_LENGTH).fill(''));
            otpRefs.current[0]?.focus();
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || resendCount >= 3) return;
        try {
            await api.post('/auth/resend-otp', { email: formData.email });
            setResendCount(c => c + 1);
            setResendCooldown(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(''));
            otpRefs.current[0]?.focus();
            setOtpError('');
        } catch (error) {
            setOtpError(error.response?.data?.message || 'Could not resend code. Please try again.');
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center relative">
            <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 blur-[100px] rounded-full z-[-1]"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full z-[-1]"></div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
                {/* Progress Header */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-text-muted border border-white/10'}`}>
                                    {step > s ? <CheckCircle2 size={18} /> : s}
                                </div>
                                {s < 4 && <div className={`w-8 h-0.5 rounded-full ${step > s ? 'bg-primary' : 'bg-white/5'}`}></div>}
                            </div>
                        ))}
                    </div>
                    <h1 className="text-3xl font-black text-text-main uppercase tracking-tight">
                        {step === 1 && 'Tell us about your business'}
                        {step === 2 && 'Create your admin account'}
                        {step === 3 && 'Verify your identity'}
                        {step === 4 && 'Account activated!'}
                    </h1>
                    <p className="text-text-muted font-medium mt-2">
                        {step === 1 && "Let's start with the basics of your production house."}
                        {step === 2 && 'This account will be the primary owner of your tenant.'}
                        {step === 3 && `We sent a 6-digit code to ${formData.email} and your mobile.`}
                        {step === 4 && 'Your workspace is ready. Sign in to get started.'}
                    </p>
                </div>

                <div className="glass rounded-[2rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                    <AnimatePresence mode="wait">

                        {/* Step 1 */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-text-muted">Business Name</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            name="business_name"
                                            value={formData.business_name}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                                                setFormData(prev => ({ ...prev, business_name: val, subdomain: slug }));
                                                if (errors.business_name) setErrors(prev => ({ ...prev, business_name: null }));
                                            }}
                                            type="text"
                                            placeholder="e.g. Naari Art Studio"
                                            className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-primary outline-none text-sm transition-all text-text-main"
                                        />
                                    </div>
                                    {errors.business_name && <p className="text-xs text-secondary-light font-bold">{errors.business_name}</p>}
                                </div>
                                <button onClick={nextStep} className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group">
                                    Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted">Your Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                            <input name="owner_name" value={formData.owner_name} onChange={handleInputChange} type="text" placeholder="John Doe" className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-primary outline-none text-sm" />
                                        </div>
                                        {errors.owner_name && <p className="text-xs text-secondary-light font-bold">{errors.owner_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                            <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="john@example.com" className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-primary outline-none text-sm" />
                                        </div>
                                        {errors.email && <p className="text-xs text-secondary-light font-bold">{errors.email}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-text-muted">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="••••••••" className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-primary outline-none text-sm" />
                                    </div>
                                    {errors.password && <p className="text-xs text-secondary-light font-bold">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-text-muted">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input name="password_confirmation" value={formData.password_confirmation} onChange={handleInputChange} type="password" placeholder="••••••••" className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-primary outline-none text-sm" />
                                    </div>
                                    {errors.password_confirmation && <p className="text-xs text-secondary-light font-bold">{errors.password_confirmation}</p>}
                                </div>
                                {apiError && <p className="text-xs text-secondary-light font-bold text-center">{apiError}</p>}
                                <div className="flex gap-4 pt-4">
                                    <button onClick={prevStep} className="flex-1 py-5 glass text-text-main rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 group">
                                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
                                    </button>
                                    <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl disabled:opacity-50">
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3 — OTP Entry */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                        <ShieldCheck className="text-primary" size={36} />
                                    </div>
                                </div>

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
                                            className={`w-12 h-14 text-center text-xl font-black bg-white/5 rounded-2xl border outline-none transition-all text-text-main
                                                ${otpError ? 'border-red-500' : digit ? 'border-primary' : 'border-white/10 focus:border-primary'}`}
                                        />
                                    ))}
                                </div>

                                {otpError && <p className="text-xs text-red-400 font-bold text-center">{otpError}</p>}

                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={otpLoading || otp.join('').length < OTP_LENGTH}
                                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                                >
                                    {otpLoading ? <Loader2 className="animate-spin" size={18} /> : <><ShieldCheck size={18} /> Verify Account</>}
                                </button>

                                <div className="flex items-center justify-center gap-4">
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
                            </motion.div>
                        )}

                        {/* Step 4 — Success */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-8">
                                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 animate-pulse">
                                    <CheckCircle2 className="text-green-400" size={44} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-text-main uppercase mb-3 tracking-tighter">You're all set!</h2>
                                    <p className="text-text-muted font-medium leading-relaxed max-w-sm mx-auto">
                                        Your account for <span className="text-text-main font-bold">{formData.business_name}</span> has been verified and activated.
                                    </p>
                                </div>
                                <a
                                    href={`${WEB_APP_URL}/signin`}
                                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                                >
                                    Continue to Workplace <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                                <Link to="/" className="block text-sm font-black text-text-muted uppercase tracking-widest hover:text-text-main">Back to Home</Link>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUp;
