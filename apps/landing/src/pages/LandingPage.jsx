import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Rocket,
    Layers,
    Users,
    Clock,
    ShieldCheck,
    TrendingUp,
    CheckCircle2,
    Mail,
    Phone,
    ArrowRight
} from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative px-6 py-24 md:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-float">
                        <span className="flex h-2 w-2 rounded-full bg-primary-light"></span>
                        <span className="text-xs font-black uppercase tracking-widest text-primary-light">Fashion Production ERP</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8 uppercase text-text-main">
                        Fabric to Fashion <br />
                        <span className="text-gradient">Digitized.</span>
                    </h1>
                    <p className="text-xl text-text-muted mb-10 max-w-lg leading-relaxed font-medium">
                        The ultimate operating system for textile houses. Manage sampling, merchandising, and artisan workflows in one unified cloud platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/signup" className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_20px_40px_-10px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 group hover:scale-105 transition-all">
                            Start Free Trial <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="px-8 py-4 glass text-text-main rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-all">
                            Request Demo
                        </button>
                    </div>
                </motion.div>

                <div className="relative hidden lg:block">
                    {/* Decorative Floating Elements */}
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 5, 0]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-0 right-0 w-80 h-96 glass rounded-3xl shadow-2xl p-8 z-20 overflow-hidden"
                    >
                        <div className="w-full h-4 bg-white/10 rounded-full mb-6 shimmer"></div>
                        <div className="flex gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Rocket className="text-primary" size={20} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="w-2/3 h-3 bg-white/10 rounded-full"></div>
                                <div className="w-1/2 h-2 bg-white/5 rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="w-20 h-2 bg-white/10 rounded-full"></div>
                                    <div className="w-8 h-4 bg-success/20 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="absolute top-20 right-40 w-64 h-64 bg-primary/30 blur-[60px] rounded-full animate-pulse-slow"></div>
                    <div className="absolute -bottom-10 left-0 w-64 h-64 bg-secondary/20 blur-[60px] rounded-full animate-pulse-slow delay-700"></div>
                </div>
            </div>
        </section>
    );
};

const Features = () => {
    const features = [
        {
            title: "Smart Merchandising",
            desc: "Keep T&A calendars on track. Manage BOMs and production timelines with ease.",
            icon: <Layers className="text-primary" size={24} />,
            color: "bg-primary/10"
        },
        {
            title: "Artisan Tracking",
            desc: "Assign job work to Karigars and monitor progress from cutting to final finishing.",
            icon: <Users className="text-secondary" size={24} />,
            color: "bg-secondary/10"
        },
        {
            title: "Sampling Workflow",
            desc: "Streamline the sample approval process with digital comments and status tracking.",
            icon: <Clock className="text-accent" size={24} />,
            color: "bg-accent/10"
        },
        {
            title: "Quality Assurance",
            desc: "Multi-stage QA checkpoints ensure zero-defect production before final dispatch.",
            icon: <ShieldCheck className="text-success" size={24} />,
            color: "bg-success/10"
        },
        {
            title: "Yield Analytics",
            desc: "Optimize fabric consumption and reduce wastage with deep production insights.",
            icon: <TrendingUp className="text-info" size={24} />,
            color: "bg-info/10"
        },
        {
            title: "Export Ready",
            desc: "Automated GST invoices, packing lists, and export documentation in seconds.",
            icon: <CheckCircle2 className="text-warning" size={24} />,
            color: "bg-warning/10"
        }
    ];

    return (
        <section id="features" className="py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary-light mb-4">Production Intelligence</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-text-main mb-6 uppercase tracking-tight">Scale Your <span className="text-gradient">Textile Empire</span></h3>
                    <p className="text-text-muted max-w-2xl mx-auto font-medium">
                        Digitize every stitch. From boutique designers to large-scale factories, Vastraa OS adapts to your unique production DNA.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className="p-10 glass rounded-3xl border border-white/5 glass-hover flex flex-col items-start gap-6"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center`}>
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-black text-text-main tracking-tight uppercase">{feature.title}</h4>
                            <p className="text-text-muted font-medium leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Pricing = () => {
    const plans = [
        {
            name: "Starter",
            price: "₹1,999",
            period: "per month",
            desc: "Perfect for small boutiques and scaling artisans.",
            features: ["Up to 100 Orders/month", "5 Artisan Connections", "Standard Workflows", "Email Support"],
            button: "Start Free Trial",
            popular: false
        },
        {
            name: "Business",
            price: "₹4,999",
            period: "per month",
            desc: "Designed for high-volume textile houses.",
            features: ["Unlimited Orders", "50 Artisan Connections", "Advanced Analytics", "Priority Support", "Whitelabeling"],
            button: "Scale Now",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            period: "contact us",
            desc: "Global supply chains and multi-unit factories.",
            features: ["Custom Integrations", "On-premise support", "Private Cloud", "Dedicated Account Manager"],
            button: "Get Quote",
            popular: false
        }
    ];

    return (
        <section id="pricing" className="py-32 px-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full z-[-1]"></div>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-4">Pricing Plans</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-text-main mb-6 uppercase tracking-tight">Simple Pricing, <span className="text-gradient">No Hidden Fees</span></h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`relative p-12 glass rounded-[2.5rem] flex flex-col transition-all duration-300 ${plan.popular ? 'border-primary ring-1 ring-primary/50 scale-105 z-10 shadow-[0_30px_60px_-15px_rgba(99,102,241,0.3)]' : 'border-white/5 opacity-80'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}
                            <h4 className="text-2xl font-black text-text-main uppercase mb-2 tracking-tighter">{plan.name}</h4>
                            <p className="text-text-muted text-sm font-medium mb-8 leading-relaxed">{plan.desc}</p>
                            <div className="flex items-baseline gap-2 mb-10">
                                <span className="text-5xl font-black text-text-main tracking-tighter">{plan.price}</span>
                                <span className="text-text-muted font-bold text-sm uppercase tracking-widest">/ {plan.period}</span>
                            </div>
                            <ul className="space-y-6 mb-12 flex-grow">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-text-main/80">
                                        <CheckCircle2 size={16} className="text-primary-light shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/signup"
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all text-center ${plan.popular ? 'bg-primary text-white shadow-lg hover:shadow-primary/40' : 'bg-white/5 text-text-main hover:bg-white/10 border border-white/5'
                                    }`}>
                                {plan.button}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Contact = () => {
    return (
        <section id="contact" className="py-32 px-6">
            <div className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-x-[-20%] -translate-y-[-20%]"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-text-main mb-8 leading-[0.9] uppercase tracking-tighter">
                            Ready to <br />
                            <span className="text-gradient">Elevate </span>
                            Your Business?
                        </h2>
                        <p className="text-text-muted font-medium mb-12 max-w-md leading-relaxed">
                            Have questions or need a custom solution? Our team of experts is ready to help you optimize your production.
                        </p>
                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Mail className="text-primary" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-1">Email Us</p>
                                    <p className="font-black text-text-main hover:text-primary transition-colors">info@aksharatech.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                                    <Phone className="text-secondary" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-1">Call Support</p>
                                    <p className="font-black text-text-main hover:text-secondary transition-colors">+91 8141302341</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <input type="text" placeholder="Full Name" className="w-full px-6 py-4 glass rounded-xl border-white/5 focus:border-primary outline-none text-sm transition-all" />
                            <input type="email" placeholder="Work Email" className="w-full px-6 py-4 glass rounded-xl border-white/5 focus:border-primary outline-none text-sm transition-all" />
                        </div>
                        <input type="text" placeholder="Subject" className="w-full px-6 py-4 glass rounded-xl border-white/5 focus:border-primary outline-none text-sm transition-all" />
                        <textarea placeholder="Your Message" rows="4" className="w-full px-6 py-4 glass rounded-xl border-white/5 focus:border-primary outline-none text-sm transition-all resize-none"></textarea>
                        <button className="w-full py-5 bg-text-main text-background font-black uppercase tracking-widest text-xs rounded-xl hover:scale-[1.02] transition-all">Send Message</button>
                    </form>
                </div>
            </div>
        </section>
    );
};

const LandingPage = () => {
    return (
        <div className="flex flex-col">
            <Hero />
            <Features />
            <Pricing />
            <Contact />
        </div>
    );
};

export default LandingPage;
