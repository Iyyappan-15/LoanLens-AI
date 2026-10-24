/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E88E5',
          50: '#EBF5FD',
          100: '#D5EBFC',
          200: '#ADD8F9',
          300: '#75BFF5',
          400: '#42A5F5',
          500: '#1E88E5',
          600: '#1976D2',
          700: '#1565C0',
          800: '#0D47A1',
          900: '#0A3880',
        },
        accent: {
          DEFAULT: '#FF3D00',
          light: '#FF6E40',
          dark: '#DD2C00',
        },
        success: {
          DEFAULT: '#2E7D32',
          light: '#4CAF50',
          dark: '#1B5E20',
          bg: '#E8F5E9',
        },
        alert: {
          DEFAULT: '#E53935',
          light: '#EF5350',
          dark: '#C62828',
          bg: '#FFEBEE',
        },
        warning: {
          DEFAULT: '#F57C00',
          light: '#FF9800',
          dark: '#E65100',
          bg: '#FFF3E0',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111827',
          cardDark: '#1F2937',
          cardSubtleDark: '#374151',
        },
        canvas: {
          light: '#F5F7FA',
          dark: '#0B0F19',
        },
        darkText: '#1A1A1A',
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'soft-md': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 8px rgba(0, 0, 0, 0.04)',
        'glow-primary': '0 0 20px rgba(30, 136, 229, 0.35)',
        'glow-orange': '0 0 20px rgba(255, 61, 0, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
