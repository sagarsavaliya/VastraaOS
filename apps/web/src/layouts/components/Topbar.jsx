import React, { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, ChevronDown, LogOut, User as UserIcon, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Topbar = ({ toggleSidebar }) => {
    const { mode, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    const getUserInitial = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <header
            className="
                fixed top-0 left-0 right-0 z-40
                h-topbar-height px-4
                flex items-center justify-between
                bg-surface dark:bg-surface/80 backdrop-blur-xl border-b border-border text-text-main
                transition-[background-color,color] duration-300 ease-out
                shadow-sm
            "
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="
                        p-2 flex items-center rounded-lg border-none bg-transparent text-inherit
                        cursor-pointer transition-colors duration-200
                        hover:bg-background
                    "
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold tracking-tight hidden sm:block">Vastraa OS</h1>
            </div>

            {/* Global Search Bar */}
            <div className="flex-1 max-w-xl px-4">
                <div className={`
                    relative group transition-all duration-300
                    ${searchFocused ? 'scale-[1.02]' : 'scale-100'}
                `}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search
                            size={18}
                            className={`transition-colors duration-200 ${searchFocused ? 'text-primary' : 'text-text-muted'}`}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Search anything (Orders, Customers, Items...)"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="
                            block w-full pl-10 pr-4 py-2
                            bg-background border border-border
                            rounded-lg text-sm text-text-main placeholder-text-muted
                            outline-none focus:border-primary/50 focus:ring-primary/5
                            transition-all duration-200
                        "
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none hidden md:flex">
                        <span className="text-[10px] font-medium text-text-muted border border-border px-1.5 rounded-md bg-surface">
                            ⌘K
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="
                        p-2 flex items-center justify-center
                        bg-transparent border border-border rounded-lg text-inherit
                        cursor-pointer transition-all duration-200 ease-out
                        hover:border-primary hover:text-primary hover:-translate-y-px hover:shadow-sm
                    "
                >
                    {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="
                            flex items-center gap-1 cursor-pointer p-1.5 rounded-lg
                            transition-colors duration-200 hover:bg-background
                            border border-border rounded-lg
                        "
                    >
                        <div className="
                            w-6 h-6 rounded-full bg-primary
                            flex items-center justify-center
                            text-white font-medium shadow-sm
                        ">
                            {getUserInitial()}
                        </div>
                        <ChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </div>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="
                            absolute right-0 mt-2 w-56
                            bg-surface border border-border rounded-xl shadow-lg
                            overflow-hidden
                            animate-in fade-in slide-in-from-top-2 duration-200
                        ">
                            {/* User Info */}
                            <div className="p-4 border-b border-border">
                                <p className="text-sm font-semibold text-text-main">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-text-muted mt-1">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <button
                                    onClick={handleLogout}
                                    className="
                                        w-full px-4 py-2.5 flex items-center gap-3
                                        text-left text-sm text-text-main
                                        hover:bg-background transition-colors
                                    "
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
