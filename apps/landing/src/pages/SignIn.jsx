import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { WEB_APP_URL } from '../services/api';

const SignIn = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleSignIn = (e) => {
        e.preventDefault();
        setLoading(true);
        // On landing page, we just redirect them to the web app's signin
        // In a real scenario, we might pre-authenticate or check subdomain
        setTimeout(() => {
            window.location.href = `${WEB_APP_URL}/signin`;
        }, 1200);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                        <ShieldCheck className="text-primary" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-text-main uppercase tracking-tight">Welcome Back</h1>
                    <p className="text-text-muted font-medium mt-2">Access your textile production workspace</p>
                </div>

                <div className="glass rounded-[2rem] p-8 md:p-10 border border-white/5 shadow-2x-strong relative overflow-hidden">
                    <form onSubmit={handleSignIn} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-text-muted">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-primary outline-none text-sm transition-all font-bold"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                <>Continue to Workspace <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-sm text-text-muted font-medium">
                            Don't have a workspace?{' '}
                            <Link to="/signup" className="text-primary hover:underline font-black uppercase tracking-widest text-xs">
                                Create One
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default SignIn;
