module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.1)',
        card: '0 12px 30px rgba(15, 23, 42, 0.18)',
      },
      colors: {
        darkBlue: '#111827',
        midnightBlue: '#0f172a',
      },
    },
  },
  plugins: [],
}
