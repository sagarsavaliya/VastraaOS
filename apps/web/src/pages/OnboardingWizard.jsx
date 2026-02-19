import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Users,
    Hammer,
    CheckCircle2,
    ArrowRight,
    Plus,
    Trash2,
    Upload,
    Globe,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useEffect } from 'react';
const OnboardingWizard = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Business Identity
    const [businessData, setBusinessData] = useState({
        business_name: '',
        display_name: '',
        email: '',
        mobile: '',
        website: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    // Step 2-4: Regional, Taxation, and Operational Settings
    const [settingsData, setSettingsData] = useState({
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        measurement_unit: 'inches',
        financial_year_start: 4,
        gst_module_enabled: false,
        gst_number: '',
        gst_registered_name: '',
        pan_number: '',
        gst_invoice_prefix: 'GST',
        non_gst_invoice_prefix: 'INV',
        order_prefix: 'ORD',
        terms_and_conditions: '',
        invoice_notes: '',
        hidden_gst_percentage: ''
    });

    // Pre-populate data from authenticated user's tenant
    const { user, updateUser } = useAuth();

    const handleBusinessChange = (e) => {
        const { name, value } = e.target;
        setBusinessData(prev => ({ ...prev, [name]: value }));
    };

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettingsData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    useEffect(() => {
        if (user?.tenant) {
            setBusinessData(prev => ({
                ...prev,
                business_name: user?.tenant?.business_name || prev.business_name,
                display_name: user?.tenant?.display_name || user?.tenant?.business_name || prev.display_name,
                email: user?.tenant?.email || user?.email || prev.email,
                mobile: user?.tenant?.mobile || prev.mobile,
                city: user?.tenant?.city || prev.city,
                state: user?.tenant?.state || prev.state,
                pincode: user?.tenant?.pincode || prev.pincode,
                address: user?.tenant?.address || prev.address
            }));
        }
    }, [user]);

    // Step 2: Team Members
    const [team, setTeam] = useState([
        { name: '', email: '', role: 'manager' }
    ]);

    // Step 3: Workers
    const [workers, setWorkers] = useState([
        { name: '', type: 'Tailor', skill_level: 'Expert' }
    ]);

    const handleNext = () => {
        if (step < 6) setStep(step + 1);
        else finishOnboarding();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const addTeamMember = () => setTeam([...team, { name: '', email: '', role: 'staff' }]);
    const removeTeamMember = (index) => setTeam(team.filter((_, i) => i !== index));
    const updateTeamMember = (index, field, value) => {
        const newTeam = [...team];
        newTeam[index][field] = value;
        setTeam(newTeam);
    };

    const addWorker = () => setWorkers([...workers, { name: '', type: 'Tailor', skill_level: 'Expert' }]);
    const removeWorker = (index) => setWorkers(workers.filter((_, i) => i !== index));
    const updateWorker = (index, field, value) => {
        const newWorkers = [...workers];
        newWorkers[index][field] = value;
        setWorkers(newWorkers);
    };

    const finishOnboarding = async () => {
        setLoading(true);
        try {
            // 1. Update Tenant Info & Settings in one atomic call
            await api.put('/settings/tenant', {
                ...businessData,
                ...settingsData
            });

            // 3. Mark Onboarding as Completed in Backend
            await api.put('/settings/onboarding', {
                step: 6,
                is_completed: true
            });

            // 4. Add Team Members
            for (const member of team) {
                if (member.name && member.email) {
                    try {
                        await api.post('/users', {
                            name: member.name,
                            email: member.email,
                            role: member.role,
                            is_active: true
                        });
                    } catch (err) {
                        console.error(`Failed to add team member ${member.email}:`, err);
                    }
                }
            }

            // 5. Add Workers
            for (const worker of workers) {
                if (worker.name) {
                    try {
                        await api.post('/workers', {
                            display_name: worker.name,
                            first_name: worker.name.split(' ')[0],
                            last_name: worker.name.split(' ').slice(1).join(' ') || '',
                            mobile: businessData.mobile,
                            is_active: true,
                            specialization: worker.type
                        });
                    } catch (err) {
                        console.error(`Failed to add worker ${worker.name}:`, err);
                    }
                }
            }

            setLoading(false);
            updateUser({
                tenant: { ...user.tenant, onboarding_completed: true, ...businessData, settings: settingsData }
            });
            navigate('/');
        } catch (error) {
            console.error('Onboarding failed:', error);
            setLoading(false);
            alert('Onboarding failed. Please check your data and try again.');
        }
    };


    return (
        <div className="h-screen bg-background flex flex-col items-center py-20 px-6 relative overflow-y-auto text-text-main">
            {/* Background Orbs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-bold uppercase tracking-wider mb-6">
                        Workspace Configuration
                    </div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight mb-3">Set Up Your Workshop</h1>
                    <p className="text-text-muted font-medium">Please provide your business details to customize your Vastraa OS experience.</p>
                </div>


                {/* Stepper */}
                <div className="flex justify-between mb-12 relative px-4">
                    <div className="absolute top-6 left-[48px] right-[48px] h-0.5 bg-border z-0"></div>
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                        <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all shadow-sm ${step >= s ? 'bg-primary text-white scale-110 shadow-primary/10' : 'bg-surface text-text-muted border border-border'
                                }`}>
                                {step > s ? <CheckCircle2 size={20} /> : s}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${step >= s ? 'text-primary' : 'text-text-muted'}`}>
                                {s === 1 && "Identity"}
                                {s === 2 && "Regional"}
                                {s === 3 && "Taxation"}
                                {s === 4 && "Operations"}
                                {s === 5 && "Team"}
                                {s === 6 && "Review"}
                            </span>
                        </div>
                    ))}
                </div>


                {/* Content Area */}
                <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-border shadow-premium relative min-h-[500px] flex flex-col bg-surface dark:bg-surface">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Business Name</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                            <input
                                                name="business_name"
                                                value={businessData.business_name}
                                                onChange={handleBusinessChange}
                                                type="text"
                                                placeholder="e.g. Vastraa Studios"
                                                className="w-full pl-12 pr-4 py-3 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all text-text-main placeholder:text-text-muted"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Display Name (on Invoices)</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                            <input
                                                name="display_name"
                                                value={businessData.display_name}
                                                onChange={handleBusinessChange}
                                                type="text"
                                                placeholder="e.g. Vastraa"
                                                className="w-full pl-12 pr-4 py-3 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all text-text-main placeholder:text-text-muted"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Email Address</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                            <input
                                                name="email"
                                                value={businessData.email}
                                                onChange={handleBusinessChange}
                                                type="email"
                                                placeholder="contact@business.com"
                                                className="w-full pl-12 pr-4 py-3 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all text-text-main placeholder:text-text-muted"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Mobile Number</label>
                                        <div className="relative group">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                            <input
                                                name="mobile"
                                                value={businessData.mobile}
                                                onChange={handleBusinessChange}
                                                type="text"
                                                placeholder="+91 00000 00000"
                                                className="w-full pl-12 pr-4 py-3 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all text-text-main placeholder:text-text-muted"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Website (Optional)</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                            <input
                                                name="website"
                                                value={businessData.website}
                                                onChange={handleBusinessChange}
                                                type="text"
                                                placeholder="www.vastraa.com"
                                                className="w-full pl-12 pr-4 py-3 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all text-text-main placeholder:text-text-muted"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Workshop/Shop Address</label>
                                    <textarea
                                        name="address"
                                        value={businessData.address}
                                        onChange={handleBusinessChange}
                                        rows="3"
                                        placeholder="Full address of your production house..."
                                        className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all resize-none text-text-main placeholder:text-text-muted"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">City</label>
                                        <input
                                            name="city"
                                            value={businessData.city}
                                            onChange={handleBusinessChange}
                                            type="text"
                                            className="w-full px-6 py-3 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all text-text-main"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">State</label>
                                        <input
                                            name="state"
                                            value={businessData.state}
                                            onChange={handleBusinessChange}
                                            type="text"
                                            className="w-full px-6 py-3 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all text-text-main"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Pincode</label>
                                        <input
                                            name="pincode"
                                            value={businessData.pincode}
                                            onChange={handleBusinessChange}
                                            type="text"
                                            className="w-full px-6 py-3 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all text-text-main"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Currency Configuration</label>
                                        <select
                                            name="currency"
                                            value={settingsData.currency}
                                            onChange={handleSettingsChange}
                                            className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all appearance-none text-text-main"
                                        >
                                            <option value="INR">Indian Rupee (₹)</option>
                                            <option value="USD">US Dollar ($)</option>
                                            <option value="EUR">Euro (€)</option>
                                            <option value="GBP">British Pound (£)</option>
                                        </select>
                                        <p className="text-[10px] text-text-muted">This will be used for all orders and invoices.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Timezone</label>
                                        <select
                                            name="timezone"
                                            value={settingsData.timezone}
                                            onChange={handleSettingsChange}
                                            className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all appearance-none text-text-main"
                                        >
                                            <option value="Asia/Kolkata">India (IST)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">Eastern Time (ET)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Measurement System</label>
                                        <div className="flex gap-4">
                                            {['inches', 'cm'].map((unit) => (
                                                <button
                                                    key={unit}
                                                    onClick={() => setSettingsData(prev => ({ ...prev, measurement_unit: unit }))}
                                                    className={`flex-1 py-4 rounded-2xl border font-black uppercase tracking-widest text-xs transition-all ${settingsData.measurement_unit === unit
                                                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                                        : 'bg-background border-border text-text-muted hover:border-text-muted'
                                                        }`}
                                                >
                                                    {unit === 'inches' ? 'Inches (")' : 'Centimeters (cm)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Fiscal Year Starts In</label>
                                        <select
                                            name="financial_year_start"
                                            value={settingsData.financial_year_start}
                                            onChange={handleSettingsChange}
                                            className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all appearance-none"
                                        >
                                            <option value={4}>April (Standard for India)</option>
                                            <option value={1}>January (Calendar Year)</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] flex items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <h3 className="font-black text-text-main uppercase tracking-tight mb-1">GST Module Activation</h3>
                                        <p className="text-xs text-text-muted font-medium">Enable this if your business is GST registered in India.</p>
                                    </div>
                                    <button
                                        onClick={() => setSettingsData(prev => ({ ...prev, gst_module_enabled: !prev.gst_module_enabled }))}
                                        className={`w-16 h-8 rounded-full transition-all relative ${settingsData.gst_module_enabled ? 'bg-primary' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settingsData.gst_module_enabled ? 'right-1' : 'left-1 shadow-sm'}`} />
                                    </button>
                                </div>

                                {settingsData.gst_module_enabled ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">GST Identification Number (GSTIN)</label>
                                            <input
                                                name="gst_number"
                                                value={settingsData.gst_number || ''}
                                                onChange={handleSettingsChange}
                                                type="text"
                                                placeholder="27AAAAA0000A1Z5"
                                                className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm font-mono tracking-widest uppercase text-text-main placeholder:text-text-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Registered Business Name</label>
                                            <input
                                                name="gst_registered_name"
                                                value={settingsData.gst_registered_name || ''}
                                                onChange={handleSettingsChange}
                                                type="text"
                                                placeholder="Legal business name for tax filings"
                                                className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm text-text-main placeholder:text-text-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">PAN Number</label>
                                            <input
                                                name="pan_number"
                                                value={settingsData.pan_number || ''}
                                                onChange={handleSettingsChange}
                                                type="text"
                                                placeholder="ABCDE1234F"
                                                className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm font-mono tracking-widest uppercase text-text-main placeholder:text-text-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Hidden GST Percentage (Optional)</label>
                                            <input
                                                name="hidden_gst_percentage"
                                                value={settingsData.hidden_gst_percentage || ''}
                                                onChange={handleSettingsChange}
                                                type="number"
                                                placeholder="e.g. 18"
                                                className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm text-text-main placeholder:text-text-muted"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-12 border-2 border-dashed border-border rounded-[2.5rem] text-center">
                                        <Sparkles className="mx-auto text-text-muted mb-4 opacity-20" size={40} />
                                        <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Operating as Non-GST Business</p>
                                        <p className="text-[11px] text-text-muted mt-2">You can always enable GST later from the settings dashboard.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">GST Invoice Prefix</label>
                                        <input
                                            name="gst_invoice_prefix"
                                            value={settingsData.gst_invoice_prefix}
                                            onChange={handleSettingsChange}
                                            type="text"
                                            className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary font-bold transition-all text-text-main"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Non-GST Prefix</label>
                                        <input
                                            name="non_gst_invoice_prefix"
                                            value={settingsData.non_gst_invoice_prefix}
                                            onChange={handleSettingsChange}
                                            type="text"
                                            className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary font-bold transition-all text-text-main"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Order Prefix</label>
                                        <input
                                            name="order_prefix"
                                            value={settingsData.order_prefix}
                                            onChange={handleSettingsChange}
                                            type="text"
                                            className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary font-bold transition-all text-text-main"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Terms & Conditions</label>
                                        <textarea
                                            name="terms_and_conditions"
                                            value={settingsData.terms_and_conditions}
                                            onChange={handleSettingsChange}
                                            rows="4"
                                            placeholder="Standard terms and conditions printed on invoices..."
                                            className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all resize-none text-text-main placeholder:text-text-muted"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Default Invoice Notes</label>
                                        <textarea
                                            name="invoice_notes"
                                            value={settingsData.invoice_notes}
                                            onChange={handleSettingsChange}
                                            rows="2"
                                            placeholder="e.g. Thank you for your business!"
                                            className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:border-primary outline-none text-sm transition-all resize-none text-text-main placeholder:text-text-muted"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Management Team</h3>
                                        <button
                                            onClick={addTeamMember}
                                            className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:opacity-80 transition-all"
                                        >
                                            <Plus size={16} /> Add Member
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {team.map((member, index) => (
                                            <div key={index} className="p-4 bg-background rounded-2xl border border-border flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Users size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        placeholder="Name"
                                                        value={member.name}
                                                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                                        className="w-full bg-transparent border-none outline-none font-bold text-sm"
                                                    />
                                                    <input
                                                        placeholder="Email"
                                                        value={member.email}
                                                        onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                                                        className="w-full bg-transparent border-none outline-none text-xs text-text-muted placeholder:text-text-muted/50"
                                                    />
                                                </div>
                                                <button onClick={() => removeTeamMember(index)} className="opacity-0 group-hover:opacity-100 text-secondary transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4 pt-6 border-t border-border">
                                        <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Artisans & Workers</h3>
                                        <button
                                            onClick={addWorker}
                                            className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:opacity-80 transition-all"
                                        >
                                            <Plus size={16} /> Add Artisan
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {workers.map((worker, index) => (
                                            <div key={index} className="p-4 bg-background rounded-2xl border border-border flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                    <Hammer size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        placeholder="Artisan Name"
                                                        value={worker.name}
                                                        onChange={(e) => updateWorker(index, 'name', e.target.value)}
                                                        className="w-full bg-transparent border-none outline-none font-bold text-sm"
                                                    />
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={worker.type}
                                                            onChange={(e) => updateWorker(index, 'type', e.target.value)}
                                                            className="bg-transparent border-none outline-none text-xs text-text-muted uppercase font-black"
                                                        >
                                                            <option value="Tailor">Tailor</option>
                                                            <option value="Cutter">Cutter</option>
                                                            <option value="Finisher">Finisher</option>
                                                            <option value="Ironing">Ironing</option>
                                                        </select>
                                                        <select
                                                            value={worker.skill_level}
                                                            onChange={(e) => updateWorker(index, 'skill_level', e.target.value)}
                                                            className="bg-transparent border-none outline-none text-xs text-text-muted uppercase font-black"
                                                        >
                                                            <option value="Expert">Expert</option>
                                                            <option value="Skilled">Skilled</option>
                                                            <option value="Semi-Skilled">Semi-Skilled</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeWorker(index)} className="opacity-0 group-hover:opacity-100 text-secondary transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 6 && (
                            <motion.div
                                key="step6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6 p-8 bg-background rounded-[2.5rem] border border-border">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Identity Overview</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Business Name</p>
                                                <p className="font-bold text-text-main">{businessData.business_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Location</p>
                                                <p className="font-bold text-text-main">{businessData.city}, {businessData.state}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Taxation</p>
                                                <p className="font-bold text-text-main">{settingsData.gst_module_enabled ? `GST Active (${settingsData.gst_number})` : 'Non-GST Setup'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6 p-8 bg-background rounded-[2.5rem] border border-border">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Infrastructure</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-text-muted uppercase">Team Members</span>
                                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black">{team.length}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-text-muted uppercase">Artisans</span>
                                                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-lg text-xs font-black">{workers.length}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-text-muted uppercase">Currency</span>
                                                <span className="font-black text-text-main">{settingsData.currency}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] text-center">
                                    <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter mb-2">Ready to launch?</h3>
                                    <p className="text-sm font-medium text-text-muted">By clicking Launch Workspace, we will initialize your workspace with these settings.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer Controls */}
                    <div className="mt-auto pt-8 flex gap-4">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex-1 py-4 px-6 rounded-2xl border border-border font-bold text-text-muted hover:bg-surface transition-all uppercase tracking-wider text-xs"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={step === 6 ? finishOnboarding : handleNext}
                            disabled={loading}
                            className="flex-[2] py-4 px-6 rounded-2xl bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-xs disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {step === 6 ? "Launch Workspace" : "Continue"}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingWizard;
