/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  darkMode: "class",

  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            code: {
              backgroundColor: theme("colors.zinc.100"),
              color: theme("colors.indigo.600"),
              paddingInline: "0.25rem",
              borderRadius: "0.25rem",
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
          },
        },
        invert: {
          css: {
            code: {
              backgroundColor: theme("colors.zinc.900"),
              color: theme("colors.indigo.300"),
            },
          },
        },
      }),
    },
  },
};
