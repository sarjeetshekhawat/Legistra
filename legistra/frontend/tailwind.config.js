/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        legal: {
          blue: '#1e40af',
          gray: '#64748b',
          light: '#f8fafc',
        },
        dark: {
          primary: {
            50: '#1e3a8a',
            100: '#1e40af',
            200: '#1e40af',
            300: '#1e40af',
            400: '#1e40af',
            500: '#1e40af',
            600: '#1e40af',
            700: '#1e40af',
            800: '#1e40af',
            900: '#1e40af',
          },
          background: '#111827',
          foreground: '#f9fafb',
          card: '#1f2937',
          border: '#374151',
          text: '#f9fafb',
          muted: '#6b7280',
          accent: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
