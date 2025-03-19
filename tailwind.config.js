/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Updated color palette with better green & red feedback colors
                primary: '#F9A826', // Warm amber gold - kept as main brand color
                secondary: '#39B9D2', // Bright blue accent
                accent: '#7854F4', // Rich purple accent that complements amber & green
                error: '#E53935', // Vibrant red for errors (adjusted for better contrast)
                success: '#4CAF50', // Rich green for success (more natural green)
                ink: '#333333', // Dark gray for text
                'ink-light': '#8A8A8A', // Medium gray for secondary text
                paper: '#F8F8F8', // Very light gray for backgrounds
                background: '#FFFFFF', // White for container backgrounds
                light: '#FFFFFF', // White for container backgrounds
                card: '#FFFFFF', // Card background

                // Badge colors
                gold: '#F9A826', // Gold badge color (same as primary)
                blue: '#39B9D2', // Blue badge color
                red: '#E53935', // Red badge (same as error)
                green: '#4CAF50', // Green badge (same as success)
                purple: '#7854F4', // Purple badge (same as accent)
            },
            fontFamily: {
                arabic: ['Amiri', 'Scheherazade New', 'Traditional Arabic', 'Tahoma', 'serif'],
                sans: ['Arial', 'sans-serif'],
                sketch: ['Cabin Sketch', 'cursive'],
                hand: ['Patrick Hand', 'cursive'],
            },
            boxShadow: {
                card: '0 2px 8px rgba(0, 0, 0, 0.05)',
                button: '0 2px 4px rgba(0, 0, 0, 0.1)',
                'button-hover': '0 4px 8px rgba(0, 0, 0, 0.1)',
                'button-pressed': '0 1px 2px rgba(0, 0, 0, 0.1)',
            },
            borderRadius: {
                xl: '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
                full: '9999px',
            },
            animation: {
                'bounce-slow': 'bounce 2s infinite',
                'bounce-once': 'bounce 0.6s ease-in-out',
                'pulse-slow': 'pulse 2s infinite',
                'spin-slow': 'spin 2s ease-in-out',
                wobble: 'wobble 0.5s ease-in-out',
                'pop-in': 'popIn 0.3s ease-out forwards',
                blink: 'blink 0.8s step-end infinite',
                'score-change': 'scoreChange 0.5s ease-out',
                float: 'float 3s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
