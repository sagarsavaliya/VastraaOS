/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                'primary-hover': 'var(--color-primary-hover)',
                secondary: 'var(--color-secondary)',
                'secondary-hover': 'var(--color-secondary-hover)',

                success: 'var(--color-success)',
                warning: 'var(--color-warning)',
                error: 'var(--color-error)',
                info: 'var(--color-info)',

                background: 'var(--color-background)',
                'background-content': 'var(--color-background-content)',
                surface: 'var(--color-surface)',
                'surface-hover': 'var(--color-surface-hover)',

                'text-main': 'var(--color-text-main)',
                'text-secondary': 'var(--color-text-secondary)',
                'text-muted': 'var(--color-text-muted)',

                border: 'var(--color-border)',
                'border-hover': 'var(--color-border-hover)',
            },
            fontFamily: {
                base: ['var(--font-family-base)'],
                heading: ['var(--font-family-heading)'],
            },
            fontSize: {
                base: 'var(--font-size-base)',
            },
            lineHeight: {
                base: 'var(--line-height-base)',
            },
            spacing: {
                'sidebar-width': 'var(--sidebar-width)',
                'sidebar-collapsed-width': 'var(--sidebar-collapsed-width)',
                'topbar-height': 'var(--topbar-height)',
                'footer-height': 'var(--footer-height)',
                'container-max': 'var(--container-max-width)',
            },
            borderRadius: {
                sm: 'var(--border-radius-sm)',
                md: 'var(--border-radius-md)',
                lg: 'var(--border-radius-lg)',
                xl: 'var(--border-radius-xl)',
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
            },
            zIndex: {
                'topbar': '40',
                'sidebar': '30',
                'footer': '20',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            animation: {
                shimmer: 'shimmer 2s infinite',
            },
        },
    },
    plugins: [],
}
