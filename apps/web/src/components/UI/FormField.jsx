import React from 'react';

const FormField = ({
    label,
    error,
    required,
    children,
    className = "",
    description
}) => {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-bold text-text-secondary flex items-center gap-1">
                    {label}
                    {required && <span className="text-error mt-0.5">*</span>}
                </label>
            )}

            <div className="relative">
                {children}
            </div>

            {description && !error && (
                <p className="text-xs text-text-muted">{description}</p>
            )}

            {error && (
                <p className="text-xs font-medium text-error animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormField;
