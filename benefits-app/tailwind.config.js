/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary:   '#FECE14',
        secondary: '#000000',
        success:   '#16A34A',
        warning:   '#D97706',
        danger:    '#DC2626',
        surface:   '#FFFFFF',
        'text-main': '#111827',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
        'yellow': '0 4px 20px 0 rgb(254 206 20 / 0.35)',
      }
    }
  },
  plugins: []
};
