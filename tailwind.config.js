/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#3498db',
                secondary: '#2ecc71',
                accent: '#f39c12',
                error: '#e74c3c',
                success: '#2ecc71',
                background: '#f9f9f9',
                dark: '#2c3e50',
                light: '#ecf0f1',
            },
            fontFamily: {
                arabic: ['Amiri', 'Scheherazade New', 'Traditional Arabic', 'Tahoma', 'serif'],
                sans: ['Arial', 'sans-serif'],
            },
            boxShadow: {
                card: '0 4px 10px rgba(0, 0, 0, 0.1)',
                button: '0 4px 10px rgba(52, 152, 219, 0.3)',
                'button-hover': '0 6px 15px rgba(52, 152, 219, 0.4)',
            },
        },
    },
    plugins: [],
};
