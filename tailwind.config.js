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
                    500: 'var(--primary)',
                    DEFAULT: 'var(--primary)',
                    600: 'var(--primary-dark)',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                silver: {
                    100: '#f5f5f5',
                    200: '#e0e0e0',
                    300: '#cccccc',
                    400: '#b3b3b3',
                    500: '#999999',
                    600: '#808080',
                    700: '#666666',
                    800: '#4d4d4d',
                    900: '#333333',
                    DEFAULT: '#b3b3b3',
                    metallic: '#a8b0c2',
                    dark: '#737b8c',
                    light: '#d5d9e5',
                },
                dark: {
                    bg: 'var(--dark-bg)',
                    card: 'var(--dark-card)',
                    border: 'var(--dark-border)',
                    100: 'var(--dark-card)',
                    200: 'var(--dark-bg)',
                    300: '#11111b',
                    400: '#0a0a12',
                    android: '#0d0d0d', // Deep android black
                    surface: '#18181a', // Android elevated surface
                },
                accent: 'var(--accent)',
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                },
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                '3d': '0 4px 6px -1px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                '3d-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                'inner-metallic': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4), inset 0 -1px 2px 0 rgba(255, 255, 255, 0.05)',
                'android-card': '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                'silver-glow': '0 0 15px rgba(168, 176, 194, 0.3)',
            },
            backgroundImage: {
                'silver-gradient': 'linear-gradient(145deg, #d5d9e5 0%, #a8b0c2 50%, #737b8c 100%)',
                'silver-inverse': 'linear-gradient(145deg, #737b8c 0%, #a8b0c2 50%, #d5d9e5 100%)',
                'android-card-gradient': 'linear-gradient(145deg, #1f1f22 0%, #151518 100%)',
                'android-bg-gradient': 'linear-gradient(to bottom, #0a0a0c 0%, #121214 100%)',
            }
        },
    },
    plugins: [],
};
