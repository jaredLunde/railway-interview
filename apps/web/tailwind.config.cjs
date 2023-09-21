const { fontFamily } = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx,astro}"],
  theme: {
    fontFamily: {
      brand: ["Satoshi", ...fontFamily.sans],
      sans: [fontFamily.sans],
      mono: [fontFamily.mono],
    },

    extend: {
      gridTemplateColumns: {
        "grow-l": "minmax(0, 1fr) max-content",
        "grow-r": "max-content minmax(0, 1fr)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        spinner: "spin 960ms cubic-bezier(0.8, 0.6, 0.2, 1) infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    plugin(({ addBase }) => {
      addBase({
        body: {
          lineHeight: `calc(1em + 1ex)`,
          letterSpacing: "-0.001em",
          textRendering: "optimizeSpeed",
        },
        b: {
          fontWeight: "600",
        },
      });
    }),
  ],
};
