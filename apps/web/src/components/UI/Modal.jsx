import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md', // sm, md, lg, xl, full
    showClose = true
}) => {
    const [isShaking, setIsShaking] = useState(false);

    const triggerHighlight = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                triggerHighlight();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    // Prevent scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw]'
    };

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/40 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={triggerHighlight}
            />

            {/* Modal Container */}
            <div className={`
                relative w-full ${sizes[size]} bg-surface rounded-3xl border border-border 
                shadow-2xl shadow-primary/10 flex flex-col max-h-[90vh] text-text-main overflow-hidden
                animate-in zoom-in-95 fade-in duration-300 slide-in-from-bottom-4
                ${isShaking ? 'animate-shake' : ''}
            `}>
                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        20%, 60% { transform: translateX(-4px); }
                        40%, 80% { transform: translateX(4px); }
                    }
                    .animate-shake {
                        animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                    }
                `}</style>

                {/* Header */}
                <div className="flex items-center justify-between py-4 px-6 border-b border-border">
                    <h3 className="text-lg font-bold text-text-main">{title}</h3>
                    {showClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-background rounded-xl text-text-muted hover:text-text-main transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto ">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="shrink-0 py-4 px-6 border-t border-border bg-surface">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
