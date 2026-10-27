import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18221f",
        muted: "#65716b",
        brand: "#176b52",
        "brand-dark": "#10513e",
        cream: "#f7f8f4",
        line: "#e5e9e4"
      },
      boxShadow: {
        soft: "0 12px 35px rgba(21, 48, 37, .08)"
      }
    }
  },
  plugins: []
};
export default config;