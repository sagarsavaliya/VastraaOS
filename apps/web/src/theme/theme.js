export const defaultTheme = {
    light: {
        // Brand Colors
        '--color-primary': '#3e41dfff',
        '--color-primary-hover': '#3830d3ff',
        '--color-secondary': '#ec4899', // Pink 500
        '--color-secondary-hover': '#db2777', // Pink 600

        // Functional Colors
        '--color-success': '#22c55e', // Green 500
        '--color-warning': '#eab308', // Yellow 500
        '--color-error': '#ef4444',   // Red 500
        '--color-info': '#3b82f6',    // Blue 500

        // Neutral Colors
        '--color-background': '#ffffff',
        '--color-background-content': '#f1f5f9', // Slate 100
        '--color-surface': '#ffffff',
        '--color-surface-hover': '#f8fafc',
        '--color-text-main': '#0f172a',    // Slate 900
        '--color-text-secondary': '#64748b', // Slate 500
        '--color-text-muted': '#94a3b8',   // Slate 400
        '--color-border': '#e2e8f0',       // Slate 200
        '--color-border-hover': '#cbd5e1', // Slate 300

        // Typography
        '--font-family-base': '"Inter", system-ui, sans-serif',
        '--font-family-heading': '"Inter", system-ui, sans-serif',
        '--font-size-base': '16px',
        '--line-height-base': '1.5',

        // Layout
        '--sidebar-width': '260px',
        '--sidebar-collapsed-width': '64px',
        '--topbar-height': '64px',
        '--footer-height': '48px',
        '--container-max-width': '1200px',

        // Shape
        '--border-radius-sm': '0.25rem',
        '--border-radius-md': '0.5rem',
        '--border-radius-lg': '0.75rem',
        '--border-radius-xl': '1rem',

        // Effects
        '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
    dark: {
        // Brand Colors
        '--color-primary': '#3e41dfff',
        '--color-primary-hover': '#3830d3ff',
        '--color-secondary': '#f472b6',
        '--color-secondary-hover': '#ec4899',

        // Functional Colors
        '--color-success': '#4ade80',
        '--color-warning': '#facc15',
        '--color-error': '#f87171',
        '--color-info': '#60a5fa',

        // Neutral Colors
        '--color-background': '#0f172a', // Slate 900
        '--color-background-content': '#020617', // Slate 950
        '--color-surface': '#1e293b', // Slate 800
        '--color-surface-hover': '#334155', // Slate 700
        '--color-text-main': '#f8fafc', // Slate 50
        '--color-text-secondary': '#94a3b8', // Slate 400
        '--color-text-muted': '#64748b', // Slate 500
        '--color-border': '#334155', // Slate 700
        '--color-border-hover': '#475569', // Slate 600

        // Typography (Same as light usually, but can be overridden)
        '--font-family-base': '"Inter", system-ui, sans-serif',
        '--font-family-heading': '"Inter", system-ui, sans-serif',
        '--font-size-base': '16px',
        '--line-height-base': '1.5',

        // Layout
        '--sidebar-width': '260px',
        '--sidebar-collapsed-width': '64px',
        '--topbar-height': '64px',
        '--footer-height': '48px',
        '--container-max-width': '1200px',

        // Shape
        '--border-radius-sm': '0.25rem',
        '--border-radius-md': '0.5rem',
        '--border-radius-lg': '0.75rem',
        '--border-radius-xl': '1rem',

        // Effects (Adjusted for dark mode visibility if needed, or keep standard)
        '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    }
};
