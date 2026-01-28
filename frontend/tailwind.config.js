export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          950: "#020617",
          900: "#0f172a",
          800: "#1e293b",
        },
        neon: {
          blue: "#38bdf8",
          violet: "#818cf8",
        },
        glass: "rgba(255,255,255,0.06)",
      },
      backdropBlur: {
        glass: "12px",
      },
      boxShadow: {
        soft: "0 0 40px rgba(56,189,248,0.08)",
        glow: "0 0 20px rgba(56,189,248,0.3)",
      },
    },
  },
  plugins: [],
};
