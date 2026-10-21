/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#08080a",
        surface: {
          DEFAULT: "#0f0f13",
          card: "#141419",
          elevated: "#1b1b22",
          border: "#262631",
          goldBorder: "rgba(212, 175, 55, 0.25)",
        },
        mirage: {
          black: "#060608",
          charcoal: "#121217",
          dark: "#181820",
          card: "#15152c",
          gold: {
            DEFAULT: "#d4af37",
            light: "#f5d77f",
            bright: "#ffd700",
            hover: "#e5be49",
            dark: "#aa820a",
            muted: "rgba(212, 175, 55, 0.15)",
          },
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F5D77F 0%, #D4AF37 50%, #A67C1E 100%)",
        "gold-gradient-hover": "linear-gradient(135deg, #FFE89E 0%, #E5BE49 50%, #B88B25 100%)",
        "gold-card": "linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(20, 20, 25, 0.95) 100%)",
        "dark-radial": "radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.12) 0%, rgba(8, 8, 10, 0.98) 70%)",
      },
      boxShadow: {
        "gold-glow": "0 0 25px -5px rgba(212, 175, 55, 0.35)",
        "gold-sm": "0 0 12px -2px rgba(212, 175, 55, 0.25)",
        "card-dark": "0 10px 30px -10px rgba(0, 0, 0, 0.7)",
      },
    },
  },
  plugins: [],
};

