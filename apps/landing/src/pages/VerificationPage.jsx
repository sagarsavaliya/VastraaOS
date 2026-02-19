import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import api, { WEB_APP_URL } from '../services/api';

const VerificationPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verifying your account...');
    const [subdomain, setSubdomain] = useState('');

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token || !email) {
                setStatus('error');
                setMessage('Invalid verification link. Please check your email again.');
                return;
            }

            try {
                const response = await api.post('/auth/verify-tenant', {
                    token,
                    email
                });

                setStatus('success');
                setMessage(response.data.message);
                setSubdomain(response.data.subdomain);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
            }
        };

        verifyEmail();
    }, [token, email]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[120px] rounded-full z-[-1]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass max-w-lg w-full p-12 rounded-[2.5rem] border border-white/5 text-center shadow-2xl"
            >
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin text-primary mb-6" size={50} />
                        <h1 className="text-2xl font-black text-text-main uppercase tracking-tight">Verifying...</h1>
                        <p className="text-text-muted font-medium mt-2">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-success/10 rounded-2xl flex items-center justify-center mb-8 border border-success/20 animate-pulse">
                            <ShieldCheck className="text-success" size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-text-main uppercase tracking-tighter mb-4">Account Verified!</h1>
                        <p className="text-text-muted font-medium mb-10 leading-relaxed">
                            Successfully verified your business account. You can now log into your workstation and complete your setup.
                        </p>
                        <a
                            href={`${WEB_APP_URL}/signin`}
                            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                        >
                            Continue to Workplace <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mb-8 border border-secondary/20">
                            <XCircle className="text-secondary" size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-text-main uppercase tracking-tighter mb-4">Verification Failed</h1>
                        <p className="text-text-muted font-medium mb-10 leading-relaxed">
                            {message}
                        </p>
                        <div className="flex flex-col gap-4 w-full">
                            <Link to="/signup" className="w-full py-5 bg-white/5 text-text-main rounded-2xl font-black uppercase tracking-widest text-sm border border-white/5 hover:bg-white/10 transition-all">Try Registering Again</Link>
                            <button className="text-sm font-black text-primary uppercase tracking-widest hover:underline">Contact Support</button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default VerificationPage;
