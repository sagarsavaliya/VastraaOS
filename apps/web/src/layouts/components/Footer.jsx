import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer
            className="
                fixed bottom-0 left-0 right-0 z-footer
                h-footer-height px-4
                flex items-center justify-between
                bg-surface border-t border-border text-text-secondary text-sm
            "
        >
            <div className="flex items-center gap-1">
                <span>Made with</span>
                <span className="text-red-500 animate-pulse-fast inline-block">
                    <Heart size={16} fill="currentColor" />
                </span>
                <span>by Akshara Technologies</span>
            </div>
            <div className="flex gap-4">
                <a href="#" className="text-inherit no-underline hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="text-inherit no-underline hover:text-primary transition-colors">Terms of Service</a>
            </div>
        </footer>
    );
};

export default Footer;
