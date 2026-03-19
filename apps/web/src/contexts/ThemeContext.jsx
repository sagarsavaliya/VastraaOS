import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultTheme } from '../theme/theme';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'dark';
    });

    const [themeConfig, setThemeConfig] = useState(() => {
        const saved = localStorage.getItem('userThemeConfig');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge: defaults fill any new vars added since last save
                return {
                    light: { ...defaultTheme.light, ...(parsed.light || {}) },
                    dark: { ...defaultTheme.dark, ...(parsed.dark || {}) },
                };
            } catch {}
        }
        return defaultTheme;
    });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Apply CSS variables to DOM whenever mode or themeConfig changes
    useEffect(() => {
        const root = document.documentElement;
        const currentTheme = themeConfig[mode];
        Object.entries(currentTheme).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        localStorage.setItem('themeMode', mode);
    }, [mode, themeConfig]);

    const toggleTheme = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const updateThemeVariable = (variable, value) => {
        setThemeConfig((prev) => ({
            ...prev,
            [mode]: { ...prev[mode], [variable]: value },
        }));
        setHasUnsavedChanges(true);
    };

    const saveTheme = () => {
        localStorage.setItem('userThemeConfig', JSON.stringify(themeConfig));
        setHasUnsavedChanges(false);
    };

    const resetTheme = () => {
        localStorage.removeItem('userThemeConfig');
        setThemeConfig(defaultTheme);
        setHasUnsavedChanges(false);
    };

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, themeConfig, updateThemeVariable, saveTheme, resetTheme, hasUnsavedChanges }}>
            {children}
        </ThemeContext.Provider>
    );
};
