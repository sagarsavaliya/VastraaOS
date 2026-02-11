import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultTheme } from '../theme/theme';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'light';
    });

    const [themeConfig, setThemeConfig] = useState(defaultTheme);

    useEffect(() => {
        const root = document.documentElement;
        const currentTheme = themeConfig[mode];

        Object.entries(currentTheme).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        localStorage.setItem('themeMode', mode);
    }, [mode, themeConfig]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const updateThemeVariable = (variable, value) => {
        setThemeConfig((prevConfig) => ({
            ...prevConfig,
            [mode]: {
                ...prevConfig[mode],
                [variable]: value,
            },
        }));
    };

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, themeConfig, updateThemeVariable }}>
            {children}
        </ThemeContext.Provider>
    );
};
