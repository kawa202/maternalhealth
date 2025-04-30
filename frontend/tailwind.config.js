/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        success: '#4CAF50',
        warning: '#FF9800',
        danger: '#F44336',
        background: '#F8F9FA',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-primary',
    'bg-success',
    'bg-warning',
    'bg-danger',
    'text-primary',
    'text-success',
    'text-warning',
    'text-danger',
    'bg-primary/10',
    'bg-success/10',
    'bg-warning/10',
    'bg-danger/10',
  ],
};