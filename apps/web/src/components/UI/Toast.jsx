import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            {createPortal(
                <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                    {toasts.map(toast => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }) => {
    const icons = {
        success: <CheckCircle2 size={20} className="text-success" />,
        error: <AlertCircle size={20} className="text-error" />,
        info: <Info size={20} className="text-primary" />
    };

    const colors = {
        success: 'border-success/20 bg-success/5',
        error: 'border-error/20 bg-error/5',
        info: 'border-primary/20 bg-primary/5'
    };

    return (
        <div className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border 
            shadow-xl backdrop-blur-md min-w-[300px] animate-in slide-in-from-right-full slide-in-from-bottom-4 duration-500
            ${colors[toast.type]}
        `}>
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="text-sm font-medium text-text-main flex-1">{toast.message}</p>
            <button
                onClick={onClose}
                className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors text-text-muted"
            >
                <X size={16} />
            </button>
        </div>
    );
};
