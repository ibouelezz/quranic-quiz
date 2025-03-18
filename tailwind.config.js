/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Vibrant, playful color palette
                primary: '#FF6B6B', // Bright coral red
                secondary: '#4ECDC4', // Turquoise
                accent: '#FFD166', // Vibrant yellow
                error: '#FF4858', // Bright red
                success: '#06D6A0', // Mint green
                ink: '#2D334A', // Dark blue-gray for text
                paper: '#FFF9F0', // Slightly off-white for backgrounds
                purple: '#9B5DE5', // Bright purple
                orange: '#F15BB5', // Bright orange-pink
                navy: '#00BBF9', // Bright blue
                mint: '#00F5D4', // Bright mint
            },
            fontFamily: {
                arabic: ['Amiri', 'Scheherazade New', 'Traditional Arabic', 'Tahoma', 'serif'],
                sans: ['Arial', 'sans-serif'],
                sketch: ['Cabin Sketch', 'cursive'],
                hand: ['Patrick Hand', 'cursive'],
            },
            boxShadow: {
                card: '0 4px 10px rgba(0, 0, 0, 0.1)',
                button: '0 6px 0 rgba(0, 0, 0, 0.1)',
                'button-hover': '0 8px 0 rgba(0, 0, 0, 0.1)',
                'button-pressed': '0 2px 0 rgba(0, 0, 0, 0.1)',
            },
            borderRadius: {
                xl: '1rem',
                '2xl': '1.5rem',
            },
            animation: {
                'bounce-slow': 'bounce 2s infinite',
                'pulse-slow': 'pulse 2s infinite',
                wobble: 'wobble 0.5s ease-in-out',
                'marker-swipe': 'markerSwipe 0.7s ease-in-out forwards',
                'pop-in': 'popIn 0.3s ease-out forwards',
                scribble: 'scribble 0.5s ease-out forwards',
            },
        },
    },
    plugins: [],
};
