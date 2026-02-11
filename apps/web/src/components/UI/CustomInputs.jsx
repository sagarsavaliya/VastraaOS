import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X, Loader2, ChevronUp } from 'lucide-react';

/**
 * ModernInput
 * Premium styled input for text, number, email, date, time
 */
export const ModernInput = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    icon: Icon,
    error,
    size = "md", // sm, md
    className = "",
    ...props
}) => {
    const [focused, setFocused] = useState(false);

    const sizes = {
        sm: "h-9 px-3",
        md: "h-11 px-4"
    };

    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            {label && (
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className={`
                relative flex items-center transition-all duration-200 rounded-xl border
                ${focused
                    ? 'border-primary ring-2 ring-primary/20 bg-background shadow-sm'
                    : 'border-border bg-background-content/10 hover:border-border-hover hover:bg-background-content/20'
                }
                ${error ? 'border-error ring-2 ring-error/10' : ''}
            `}>
                {Icon && (
                    <div className={`pl-4 transition-colors duration-200 ${focused ? 'text-primary' : 'text-text-muted'}`}>
                        <Icon size={16} strokeWidth={2.5} />
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    className={`w-full bg-transparent text-sm text-text-main placeholder-text-muted/40 outline-none ${sizes[size]}`}
                    {...props}
                />
            </div>
            {error && <span className="text-[10px] font-bold text-error ml-1 uppercase tracking-tight">{error}</span>}
        </div>
    );
};

/**
 * ModernTextArea
 */
export const ModernTextArea = ({ label, value, onChange, placeholder, error, className = "", ...props }) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            {label && (
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className={`
                transition-all duration-200 rounded-xl border
                ${focused
                    ? 'border-primary ring-2 ring-primary/20 bg-background shadow-sm'
                    : 'border-border bg-background-content/10 hover:border-border-hover hover:bg-background-content/20'
                }
                ${error ? 'border-error ring-2 ring-error/10' : ''}
            `}>
                <textarea
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 bg-transparent text-sm text-text-main placeholder-text-muted/40 outline-none min-h-[80px] resize-y"
                    {...props}
                />
            </div>
            {error && <span className="text-[10px] font-bold text-error ml-1 uppercase tracking-tight">{error}</span>}
        </div>
    );
};

/**
 * ModernButton
 */
export const ModernButton = ({
    children,
    onClick,
    variant = "primary", // primary, secondary, outline, error, ghost
    size = "md", // sm, md, lg
    icon: Icon,
    loading = false,
    disabled = false,
    className = "",
    type = "button",
    ...props
}) => {
    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-primary/20",
        secondary: "bg-surface text-text-main border border-border hover:border-border-hover hover:bg-background-content/10 shadow-sm",
        outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5",
        error: "bg-error text-white hover:bg-error/90 shadow-sm",
        ghost: "bg-transparent text-text-secondary hover:bg-background-content/30 hover:text-text-main"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs font-bold gap-1.5 rounded-lg h-9",
        md: "px-5 py-2 text-sm font-bold gap-2 rounded-xl h-11",
        lg: "px-6 py-2.5 text-sm font-bold gap-2.5 rounded-xl h-12"
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
            className={`
                flex items-center justify-center transition-all duration-200 select-none whitespace-nowrap
                ${variants[variant]}
                ${sizes[size]}
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer active:opacity-80'}
                ${className}
            `}
        >
            {loading ? (
                <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
            ) : Icon && (
                <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.5} />
            )}
            <span className="tracking-wider">{children}</span>
        </button>
    );
};

/**
 * ModernSelect
 */
export const ModernSelect = ({ label, name, value, onChange, options = [], placeholder = "Select...", error, size = "md", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const sizes = {
        sm: "h-9 px-3",
        md: "h-11 px-4"
    };

    const optionsArray = Array.isArray(options) ? options : [];
    const selectedOption = optionsArray.find(opt => opt.id?.toString() === value?.toString());

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <div
                    tabIndex={0}
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    className={`
                        flex items-center justify-between bg-background-content/10 border transition-all duration-200 rounded-xl text-sm cursor-pointer ${sizes[size]}
                        ${isOpen
                            ? 'border-primary ring-2 ring-primary/20 bg-background shadow-sm'
                            : 'border-border hover:border-border-hover hover:bg-background-content/20 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }
                        ${error ? 'border-error ring-2 ring-error/10' : ''}
                        outline-none
                    `}
                >
                    <span className={selectedOption ? 'text-text-main font-medium' : 'text-text-muted/40'}>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                    <div className={`transition-all duration-200 ${isOpen ? 'text-primary rotate-180' : 'text-text-muted'}`}>
                        <ChevronDown size={16} strokeWidth={2.5} />
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute z-[999] w-full mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-60 overflow-y-auto py-1.5 p-1.5 space-y-0.5">
                            {optionsArray.length > 0 ? (
                                optionsArray.map((opt) => (
                                    <div
                                        key={opt.id}
                                        tabIndex={0}
                                        onClick={() => {
                                            onChange({ target: { value: opt.id, name: name || label } });
                                            setIsOpen(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                onChange({ target: { value: opt.id, name: name || label } });
                                                setIsOpen(false);
                                            }
                                        }}
                                        className={`
                                            px-3 py-2 rounded-lg text-sm cursor-pointer transition-all flex items-center justify-between outline-none
                                            ${value?.toString() === opt.id.toString()
                                                ? 'bg-primary/10 text-primary font-bold'
                                                : 'text-text-secondary hover:bg-background-content/50 hover:text-text-main focus:bg-background-content/50 focus:text-text-main'}
                                        `}
                                    >
                                        {opt.name}
                                        {value?.toString() === opt.id.toString() && <Check size={14} strokeWidth={3} />}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-center text-xs text-text-muted italic">
                                    No options available
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && <span className="text-[10px] font-bold text-error ml-1 uppercase tracking-tight">{error}</span>}
        </div>
    );
};

/**
 * ModernSearchSelect
 */
export const ModernSearchSelect = ({ label, name, value, onChange, options = [], placeholder = "Search and select...", error, size = "md", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    const sizes = {
        sm: "h-9 px-3",
        md: "h-11 px-4"
    };

    const optionsArray = Array.isArray(options) ? options : [];
    const selectedOption = optionsArray.find(opt => opt.id?.toString() === value?.toString());

    const getOptionLabel = (opt) => opt.label || opt.name || 'Unknown';

    const filteredOptions = optionsArray.filter(opt => {
        const lbl = getOptionLabel(opt).toLowerCase();
        const sub = (opt.sublabel || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return lbl.includes(search) || sub.includes(search);
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <div
                    tabIndex={0}
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    className={`
                        flex items-center justify-between bg-background-content/10 border transition-all duration-200 rounded-xl text-sm cursor-pointer ${sizes[size]}
                        ${isOpen
                            ? 'border-primary ring-2 ring-primary/20 bg-background shadow-sm'
                            : 'border-border hover:border-border-hover hover:bg-background-content/20 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }
                        ${error ? 'border-error ring-2 ring-error/10' : ''}
                        outline-none
                    `}
                >
                    <span className={selectedOption ? 'text-text-main font-medium' : 'text-text-muted/40'}>
                        {selectedOption ? getOptionLabel(selectedOption) : placeholder}
                    </span>
                    <div className={`transition-all duration-200 ${isOpen ? 'text-primary rotate-180' : 'text-text-muted'}`}>
                        <ChevronDown size={16} strokeWidth={2.5} />
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute z-[999] w-full mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 border-b border-border bg-background-content/20">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Type to filter..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') setIsOpen(false);
                                    }}
                                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-xs text-text-main outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto py-1.5 p-1.5 space-y-0.5">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <div
                                        key={opt.id}
                                        tabIndex={0}
                                        onClick={() => {
                                            onChange({ target: { value: opt.id, name: name || label } });
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                onChange({ target: { value: opt.id, name: name || label } });
                                                setIsOpen(false);
                                                setSearchTerm('');
                                            }
                                        }}
                                        className={`
                                            px-3 py-2 rounded-lg text-sm cursor-pointer transition-all flex items-center justify-between outline-none
                                            ${value?.toString() === opt.id.toString()
                                                ? 'bg-primary/10 text-primary font-bold'
                                                : 'text-text-secondary hover:bg-background-content/50 hover:text-text-main focus:bg-background-content/50 focus:text-text-main'}
                                        `}
                                    >
                                        <div className="flex flex-col">
                                            <span>{getOptionLabel(opt)}</span>
                                            {opt.sublabel && (
                                                <span className="text-[10px] text-text-muted font-normal uppercase tracking-wider">
                                                    {opt.sublabel}
                                                </span>
                                            )}
                                        </div>
                                        {value?.toString() === opt.id.toString() && <Check size={14} strokeWidth={3} />}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-4 text-center text-xs text-text-muted italic">
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && <span className="text-[10px] font-bold text-error ml-1 uppercase tracking-tight">{error}</span>}
        </div>
    );
};

/**
 * ModernCheckbox
 */
export const ModernCheckbox = ({ checked, onChange, label, name, className = "", ...props }) => {
    return (
        <label className={`flex items-center gap-3 cursor-pointer border border-border rounded-xl px-2 py-1.5 group select-none transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${className}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    {...props}
                />
                <div className={`
                    w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
                    ${checked
                        ? 'bg-primary border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                        : 'bg-background border-border group-hover:border-text-muted/30 group-focus-within:border-primary'
                    }
                `}>
                    <Check
                        size={14}
                        className={`text-white transition-all duration-300 transform ${checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                        strokeWidth={4}
                    />
                </div>
            </div>
            {label && (
                <span className="text-sm font-bold text-text-secondary group-hover:text-text-main transition-colors tracking-tight">
                    {label}
                </span>
            )}
        </label>
    );
};

/**
 * ModernNumberInput
 * Premium number input with custom controls
 */
export const ModernNumberInput = ({ label, value, onChange, min, max, placeholder, error, size = "md", className = "", ...props }) => {
    const [focused, setFocused] = useState(false);

    const sizes = {
        sm: "h-9 pl-3 pr-1",
        md: "h-11 pl-4 pr-1"
    };

    const handleIncrement = () => {
        const newVal = (parseFloat(value) || 0) + 1;
        if (max === undefined || newVal <= max) {
            onChange({ target: { value: newVal, name: props.name || label } });
        }
    };

    const handleDecrement = () => {
        const newVal = (parseFloat(value) || 0) - 1;
        if (min === undefined || newVal >= min) {
            onChange({ target: { value: newVal, name: props.name || label } });
        }
    };

    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            {label && (
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className={`
                relative flex items-center transition-all duration-200 rounded-xl border ${size === 'sm' ? 'h-9' : 'h-11'}
                ${focused
                    ? 'border-primary ring-2 ring-primary/20 bg-background shadow-sm'
                    : 'border-border bg-background-content/10 hover:border-border-hover hover:bg-background-content/20'
                }
                ${error ? 'border-error ring-2 ring-error/10' : ''}
            `}>
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            handleIncrement();
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            handleDecrement();
                        }
                    }}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    className={`w-full bg-transparent text-sm text-text-main placeholder-text-muted/40 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${size === 'sm' ? 'px-3' : 'px-4'}`}
                    {...props}
                />
                <div className="flex flex-col h-full pr-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleIncrement}
                        className="flex-1 text-text-muted/40 hover:text-primary transition-all flex items-center justify-center -mb-1"
                    >
                        <ChevronUp size={14} strokeWidth={3} />
                    </button>
                    <button
                        type="button"
                        onClick={handleDecrement}
                        className="flex-1 text-text-muted/40 hover:text-primary transition-all flex items-center justify-center -mt-1"
                    >
                        <ChevronDown size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>
            {error && <span className="text-[10px] font-bold text-error ml-1 uppercase tracking-tight">{error}</span>}
        </div>
    );
};
