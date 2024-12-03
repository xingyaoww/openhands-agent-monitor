import type { Config } from 'tailwindcss';
import { nextui } from "@nextui-org/react";
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'root-primary': '#171717',
        'root-secondary': '#262626',
        'hyperlink': '#007AFF',
        'danger': '#EF3744',
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      defaultTheme: "dark",
      layout: {
        radius: {
          small: "5px",
          large: "20px",
        },
      },
      themes: {
        dark: {
          colors: {
            primary: "#4465DB",
          },
        }
      }
    }),
    typography,
  ],
};

export default config;