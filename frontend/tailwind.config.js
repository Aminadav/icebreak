/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'bubblegum': ['Bubblegum Sans', 'sans-serif'],
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'bounce': 'bounce 1s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-in': 'float-in 1.5s ease-out forwards',
        'gentle-float': 'gentle-float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px) scale(0.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        'float-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(50px) scale(0.8) rotate(-5deg)',
          },
          '50%': {
            opacity: '0.7',
            transform: 'translateY(-10px) scale(1.05) rotate(2deg)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1) rotate(0deg)',
          },
        },
        'gentle-float': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '25%': {
            transform: 'translateY(-8px) rotate(1deg)',
          },
          '50%': {
            transform: 'translateY(-5px) rotate(0deg)',
          },
          '75%': {
            transform: 'translateY(-10px) rotate(-1deg)',
          },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
    },
  },
  plugins: [],
}
