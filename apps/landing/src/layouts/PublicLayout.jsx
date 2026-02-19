import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Rocket } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'About', href: '#about' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass py-3' : 'bg-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-110 transition-transform duration-300">
                        <Rocket className="text-white" size={20} />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-text-main uppercase">
                        Vastraa<span className="text-primary-light">OS</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={location.pathname === '/' ? link.href : `/${link.href}`}
                            className="text-sm font-bold text-text-muted hover:text-text-main transition-colors uppercase tracking-widest cursor-pointer"
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                        <Link to="/signin" className="text-sm font-bold text-text-main hover:text-primary transition-colors uppercase tracking-widest">
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_20px_30px_-10px_rgba(99,102,241,0.6)] hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-text-main p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass absolute top-full left-0 right-0 p-6 animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col gap-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={location.pathname === '/' ? link.href : `/${link.href}`}
                                className="text-lg font-bold text-text-muted"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
                            <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)} className="text-center font-bold py-3 text-text-main">Sign In</Link>
                            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-center font-bold py-4 bg-primary text-white rounded-xl">Get Started</Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

const Footer = () => {
    return (
        <footer className="bg-background-lighter border-t border-white/5 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Rocket className="text-white" size={16} />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-text-main uppercase">
                                Vastraa<span className="text-primary-light">OS</span>
                            </span>
                        </Link>
                        <p className="text-text-muted max-w-sm mb-6 leading-relaxed">
                            The ultimate operating system for modern textile businesses. Streamline from order to delivery with live tracking and artisan-first workflows.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-text-main mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-text-muted font-medium">
                            <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-text-main mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-text-muted font-medium">
                            <li><a href="mailto:info@aksharatech.com" className="hover:text-primary transition-colors">info@aksharatech.com</a></li>
                            <li className="text-text-main font-bold">+91 8141302341</li>
                            <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-text-muted font-medium">
                        © {new Date().getFullYear()} Vastraa OS. Powered by Aksharatech.
                    </p>
                    <div className="flex gap-6 text-xs text-text-muted font-medium">
                        <a href="#" className="hover:text-text-main transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-text-main transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden selection:bg-primary/30">
            <Navbar />
            <main className="flex-grow pt-20">
                <div className="bg-grid fixed inset-0 z-[-1] opacity-40"></div>
                <div className="hero-gradient fixed inset-0 z-[-2]"></div>
                {/* Glow Effects */}
                <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full z-[-1]"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full z-[-1]"></div>

                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
