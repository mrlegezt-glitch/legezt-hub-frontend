/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: 'var(--primary)',      // Mapped to Global Variable
                    DEFAULT: 'var(--primary)',  // Enables bg-primary, text-primary
                    600: 'var(--primary-dark)', // Mapped to Global Variable
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                dark: {
                    bg: 'var(--dark-bg)',
                    card: 'var(--dark-card)',
                    border: 'var(--dark-border)',
                    100: 'var(--dark-card)',   // Map legacy to card
                    200: 'var(--dark-bg)',     // Map legacy to background
                    300: '#11111b',
                    400: '#0a0a12',
                },
                accent: 'var(--accent)',
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
